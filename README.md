# docker-file-bug

A reproducible case of a bug I found in Docker.

### Description

This bug was observed when I was trying to compile multiple EJS templates
at once using worker processes. I observed that occasionally, the file would
be reported as not existing, even though it definitely existed.

Eventually, I determined that this only failed if the following two conditions
were met:

* Docker is being run on a Mac
* The file that we're trying to check the existence of is on a mounted volume.

If either of those conditions are broken (the file exists in the image itself,
of Docker is run on a Linux machine), then the bug disappears.

### The reproducible case

I was able to reproduce this case with a simple program that spawns two
children with the `threads` package. Each child repeatedly checks if a file exists
and reads the file in a tight loop. On my Mac, I observe that the file sometimes
appears to not exist.

### Running

First, build the image:

```
docker build . -t docker-file-bug
```

Then, run a container with `volume` mounted at `/volume` (remember to substitute
the actual absolute path to `volume` on your machine:

```
docker run -v /absolute/path/to/docker-file-bug/volume:/volume docker-file-bug
```

You should observe logs that look something like the following truncated logs:

```
File exists.
File exists.
File exists.
File exists.
File exists.
File exists.
File exists.
File exists.
File exists.
File exists.
File exists.
File exists.
File exists.
File exists.
File exists.
File exists.
File exists.
File exists.
File exists.
File exists.
File does not exist!
File exists.
File does not exist!
File exists.
File exists.
File exists.
File does not exist!
```

### Version info

Docker version:
```
Docker version 18.03.1-ce, build 9ee9f40
```

MacOS version:
```
10.13.4 (17E199)
```

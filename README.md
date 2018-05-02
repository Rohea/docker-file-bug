# docker-file-bug

A reproducible case of a bug I found in Docker.

### Description

This bug was observed when I was trying to compile the same EJS template
in several worker processes at once. I observed that occasionally, one of the `.ejs`
files that was included from the main template I was rendering
would be reported as not existing, even though it definitely did. The
included template was being used many times in the file, and so EJS was frequently
checking if it existed and reading it.

Eventually, I determined that this failure only occurred if the following conditions
were met:

* The code is being run inside a Docker container
* Docker is being run on a Mac
* The file that we're trying to check the existence of is on a mounted volume.

If either of those conditions are broken (the code was run directly on the host,
the file exists in the image itself, of Docker is run on a Linux machine),
then the bug disappears. For this reason, I believe the bug is with Docker, and not
Node or EJS.

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

After running the container, I observe logs that look something like
the following truncated logs:

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

However, we expect to see the following (the file should never be reported as not existing):

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
File exists.
File exists.
File exists.
File exists.
File exists.
File exists.
File exists.
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

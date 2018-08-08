# File reads via symlinks on Docker for Windows randomly fail with high load

A reproducible case of a bug my organisation found in Docker. Based heavily on a
test case made by @nwalters512.

### Description

This bug was noticed when we worked on our Symfony application utilizing a private
library that was developed simultaneously using the Composer symlink functionality.
The library is mounted on a docker volume that is then symlinked to vendor instead
of installing the dependency it from packagist.
That workflow lead to API requests failing with autoloader not being able to load
classes from the library that was symlinked. After much debugging it was discovered
that this happens due to the fact that the browser makes multiple requests
simultaneously and this causes Autoloader to try to resolve thousands of files
across the symlink at the same time and some randomly fail.

* The code is being run inside a Docker container
* Docker is being run on a Windows machine
* The file is accesses via a symlink to it's parent folder when both the file and
the symlink reside on a volume.
* There are multiple concurrent FS accesses running simultaneously

This bug does not reproduce on Docker for Mac and thus I believe it's a bug in
how the Docker for Windows fileshare operates.

### The reproducible case

I was able to reproduce this case with a simple program that spawns multiple
children with the `threads` package. Each child repeatedly tries to check if a file
exists across a symlink and read the contents. On Docker for Windows this randomly
fails.

### Running

To reproduce the test case run:

```
docker-compose up --force-recreate --build
```

After running the container, I observe logs that look something like
the following truncated logs:

```
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | File does not exist!
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | File does not exist!
docker-file-bug_1  | .
docker-file-bug_1  | File does not exist!
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
```

However, we expect to see the following (the file should never be reported as not existing):

```
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
docker-file-bug_1  | .
```

### Version info

Docker version:
```
Docker version 18.06.0-ce, build 19098
```

Windows version:
```
Windows 10 Pro (Version 1709 (OS Build 16299.371))
```

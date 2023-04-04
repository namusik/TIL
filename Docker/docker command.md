## 미사용중인 docker images 삭제하기
~~~sh
docker images --format '{{.Repository}}:{{.Tag}}' | grep -vFf <(docker ps -a --format '{{.Image}}' | sort -u)
~~~

This command works by:

1. Running the **docker images** command to list all Docker images.
2. Using the **--format** option to specify the format of the output to be just the repository and tag of each image in "repository:tag" format.
3. Piping the output of **docker images** to **grep**.
4. Using the **-v** option to invert the match and show only lines that do not match.
5. Using the **-F** and **-f** options to search for patterns from a file.
6. Using process substitution **<(...)** to pass the output of **docker ps -a --format '{{.Image}}' | sort -u** as a file to **grep**.
7. **docker ps -a --format '{{.Image}}'** lists the IDs of all images used by all containers, both running and stopped. The **--format** option specifies the format of the output. **{{.Image}}** extracts the ID of the image used by the container.
8. **sort -u** sorts the list of used image IDs and removes duplicates.

This will output a list of Docker image names in the "repository:tag" format that are not in use by any running or stopped containers.
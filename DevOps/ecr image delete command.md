# ecr에서 특정 태그를 가진 이미지를 제외한 나머지 이미지들 삭제하는 command

~~~groovy
aws ecr list-images --repository-name <repository-name> --filter "tagStatus=UNTAGGED" --query 'imageIds[?imageTag!=`<tag>`].[imageDigest]' --output text | xargs aws ecr batch-delete-image --repository-name <repository-name> --image-ids
~~~

This command has two main parts: the first part retrieves a list of image digests that match a specific filter, and the second part deletes the images corresponding to those digests.

## Part 1: List Images
The first part of the command uses the **list-images** command to retrieve a list of image digests that match a specific filter. Here's a breakdown of the options and arguments:

**aws ecr list-images**: The command to list images in an ECR repository.

**--repository-name <repository-name>**: The name of the ECR repository that contains the images to be deleted.

**--filter "tagStatus=UNTAGGED"**: The filter to apply to the list of images. In this case, the filter specifies that only images with no tags should be listed.

**--query 'imageIds[?imageTag!=tag].[imageDigest]'**: 
The **--query** option in the AWS CLI allows you to use the JMESPath language to filter and transform the output of an AWS command. In this case, we're using the --query option to extract the image digests for all images in an ECR repository that have a tag that's different from a specified tag.
**imageIds**: The top-level object in the output of the list-images command is an array of imageIds objects, which contain information about each image in the repository.
**[?imageTag!=tag]**: This is a filter expression that selects only the imageIds objects where the imageTag property **is not equal** to the specified tag. Replace tag with the tag you want to preserve. Note that the backticks (`) are used to enclose the tag value in the filter expression, since the tag value itself may contain special characters that need to be escaped.
**.[imageDigest]**: This is a projection expression that selects only the imageDigest property from each selected imageIds object.
So, the --query option with this JMESPath expression will return an array of image digests, where each image digest corresponds to an image in the repository that has no tag or has a tag that's different from the specified <tag>.
--output text: The output format for the command. This option specifies that the output should be in plain text format.
The output of this command will be a list of image digests, one per line.

Part 2: Batch Delete Images
The second part of the command uses the batch-delete-image command to delete the images corresponding to the digests retrieved in part 1. Here's a breakdown of the options and arguments:

| xargs: The pipe symbol (|) is used to send the output of the first command as input to the second command. xargs is a utility that reads items from standard input and executes a command with those items as arguments.
aws ecr batch-delete-image: The command to delete images from an ECR repository.
--repository-name <repository-name>: The name of the ECR repository that contains the images to be deleted.
--image-ids: The option to specify the image digests to be deleted. This option is followed by the list of image digests retrieved in part 1, which are passed to xargs as arguments.
When this command is executed, it will delete all untagged images in the repository that have a tag different from the one specified. Note that this command will permanently delete the specified images and cannot be undone, so use it with caution.
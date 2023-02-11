# Writing Index

A script that creates an index of your writings.

## Usage

1. Go to your user page.
2. Click writing index.
3. Wait for your writings to be indexed.
4. Modify the configuration options ( see below )
5. Click on the preview and it should update in real time.
4. Click "Copy Index".
5. Paste the index into a writing.
6. Add "index" as tag, so it is not indexed next time.

## Configuration Options

a. *showLegend*: true, false
  * whether to render a legend
b. *showCounts*: true, false
  * whether to render like and comment counts
c. *showCategories*: true, false
  * whether to categorize writings based on tags
d. *categories*: category to tag array list 
  * a listing of category groups titles and the associated tags
  * the order is important as writings that match the first category won't fall through to the second.
e. *categoryOrder*: list of categories
  * the order of the filtered categories
  * omitting a category will remove it from the output
f. *hashtags*: list of hashtag prefixes
  * this is a list of prefixes that will be pulled out of the content
  * eg. \[#MyChallenge: ABC](https://www.example.com) would be pulled out and displayed if `#MyChallenge` was specified
  * this works well for challenge groups
g. *counts*: number for each like, love, adore, fire
  * the number thresholds for each level of engagement
  * both loves and commens use the same scal

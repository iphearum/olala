CRAWL=CC-MAIN-2018-39
mkdir -p stats/count/$CRAWL
for i in $(seq 0 9); do
  curl https://data.commoncrawl.org/crawl-analysis/$CRAWL/count/part-0000$i.bz2 \
    >stats/count/$CRAWL/part-0000$i.bz2
done
# docker image build -t chatbot:tag -f Dockerfile .

# docker run -d -p 6600:6600 chatbot:tag


python -c 'import secrets; print(secrets.token_hex())'
# sudo lsof -i :55* | grep LISTEN | awk '{print $2}' | xargs sudo kill -9
# sudo netstat -tuln | grep '127.0.0.1:55' | awk '{print $7}' | cut -d'/' -f1 | xargs -I {} sudo kill -9 {}
COUNT=10
PORT=6600
for i in $(seq 1 $COUNT)
do
    nohup python -m app ${PORT} >/dev/null 2>&1 &
    # docker run -d -p ${PORT}:6600 chatbot:tag
    echo "server 127.0.0.1:${PORT}"
    PORT=$((PORT+1))
done

netstat -tuln
# sudo lsof -i -P -n | grep LISTEN
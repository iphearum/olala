# pnpm build

sudo cp -r ./ /var/www/html/chatbot

sudo cp -r ./chatbot.services /etc/systemd/system/chatbot.service
sudo systemctl daemon-reload
sudo systemctl enable chatbot.service
sudo systemctl start chatbot.service
sudo systemctl status chatbot.service

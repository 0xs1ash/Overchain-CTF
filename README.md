# Overchain-CTF
This CTF is designed to identify vulnerabilities through static code analysis, chain them together, and ultimately escalate from low to critical severity to capture the flag.
## Clone the Application
### First, clone the application to your machine:
```
sudo git clone https://github.com/0xs1ash/Overchain-CTF.git
cd Overchain-CTF
```
### Docker 
#### On Ubuntu:
1.Install Docker via Snap:
```
sudo snap install docker
```
2.Build and run the Docker containers:
```
sudo docker-compose up --build
```
#### On Other Linux Distributions:
1.Install Docker:
```
sudo apt install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker
```
2.Install Docker Compose:
```
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```
3.Build and run the Docker containers:
```
sudo docker-compose up --build
```
4.Resetting progress:
```
chmod +x restart.sh
./restart.sh
```
## Solution
**Medium:** https://medium.com

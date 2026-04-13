![AquaSense Project Banner](https://github.com/RXCodes/AquaSense/raw/refs/heads/main/repository_banner.jpeg)
# Description
**Water treatment and conditioning** is an essential part of caring for any aquatic or semi-aquatic pets. However, maintaining a high-quality and uncontaminated environment to keep them healthy over long periods of time is difficult, providing a need for active water quality monitoring.
While market solutions to this problem exist, they are often either not **Internet-capable** or provide only rudimentary data monitoring that can be unhelpful to inexperienced fish owners.

We propose to develop a **device** that assesses the environment of a fish tank by observing temperature, water quality and other factors. The device may take pictures of the tank and use a recommender system to assess the images and data to make user recommendations. Data recorded from the device can be accessed from anywhere in the world using a **web server**, which can also provide the tools to examine analytics.

## ⚙️ Server
The `server` directory contains all the files and source code used to run a Node.js web server.

The server connects to an **S3 bucket** to store and read files. The `.env` file contains configurations to setup connection to the S3 bucket - you may use any provider you wish.

The `accounts.js` file allows you to create accounts that users can login. Each account can have different permissions.

You can learn about all the APIs here: https://spotty-muse-bf4.notion.site/AquaSense-API-Endpoint-Documentation-305e3e1e3ac7806cac18f9fcf8352952

## 🤖 Device
The `device` directory contains all the files and source code used to run the device.
All device-related files are located here: https://github.com/nathan-707/SmartAquarium/tree/main

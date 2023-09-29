# P2P-API

## Overview

The P2P-API is a versatile and secure peer-to-peer payment wallet system that seamlessly integrates with the Paystack payment gateway. This API is developed using Node.js and offers users a convenient and secure way to manage their digital wallets, allowing for easy funding and secure transactions.

## Features

- **Paystack Integration**: The P2P-API integrates seamlessly with the Paystack payment gateway, providing a reliable and widely-used payment processing solution for your application.

- **Wallet Management**: Users can create and manage digital wallets, facilitating easy fund transfers and payments.

- **Transaction Tracking**: Every transaction is meticulously recorded and securely stored in an SQL relational database management system (RDBMS), providing a comprehensive transaction history for users.

- **Authentication**: The app utilizes session management to ensure secure user authentication and association with their respective wallets.

## Technologies Used

- **Node.js**: The core of this API is built on Node.js, a highly-scalable, JavaScript-based runtime.

- **Sequelize**: We use Sequelize, a powerful Object-Relational Mapping (ORM) library, to interact with our SQL RDBMS, ensuring efficient and reliable data storage and retrieval.

- **Paystack**: The Paystack API integration streamlines payment processing, ensuring secure and reliable transactions.

## Getting Started

Follow these steps to get started with the P2P-API:

1. **Installation**: Clone the repository and install the necessary dependencies using npm.

   ```
   git clone https://github.com/Tu-Code/p2p-api.git
   cd p2p-api
   npm install
   ```

2. **Configuration**: Configure your Paystack API credentials and database connection settings in the appropriate configuration files.

3. **Database Setup**: Create the required database schema and tables using Sequelize migrations.

   ```
   npm run migrate
   ```

4. **Start the Server**: Launch the application server.

   ```
   npm start
   ```

5. **API Endpoints**: Explore the API endpoints by referring to the web routes file.


## Contribution

Contributions are welcome from the community! This system is a very basic setup I built when learning how to use JavaScript for Backend. If you'd like to improve this project, please send a PR.

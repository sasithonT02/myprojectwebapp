import { Sequelize } from "sequelize";

// Create a Sequelize instance and connect to your MySQL database
const sequelize = new Sequelize("online-food", "root", "", {
  host: "localhost", // or your host if it's a remote server
  dialect: "mysql",
});

export default sequelize;
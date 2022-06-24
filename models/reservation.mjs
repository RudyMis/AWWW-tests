import { DataTypes } from 'sequelize';

export default (conn) => {
  const reservations = conn.define('Reservation', {
    name: {
      type: DataTypes.STRING,
    },
    surname: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    seats: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
        max: 4,
      },
    },
  });
  return reservations;
};

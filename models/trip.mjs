import { DataTypes } from 'sequelize';

export default (conn) => {
  const trips = conn.define('Trip', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    desc: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    short_desc: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    img: {
      type: DataTypes.STRING,
      validate: {
        isUrl: true,
      },
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        is_not_negative(value) {
          if (value < 0) {
            throw new Error('negative price');
          }
        },
      },
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        is_after_start(value) {
          if (value < this.start_date) {
            throw new Error('data konca nie moze byc przed data poczatku');
          }
        },
      },
    },
    free_seats: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        is_not_negative(value) {
          if (value < 0) {
            throw new Error('negative free_seats');
          }
        },
      },
    },
  });
  return trips;
};

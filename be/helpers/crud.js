const database = require("../config/database");

class Crud {
  constructor() {
    this.selectArr = [];
    this.whereArr = [];
    this.joinArr = [];
    this.group_By = "";
    this.query = ``;
    this.order = {
      field: "",
      order: "ASC",
    };
  }

  select(str) {
    this.selectArr.push(str);
  }

  groupBy(str) {
    this.group_By = str;
  }

  where(key, operator = "=", value) {
    this.whereArr.push({ key, operator, value });
  }

  join(type, table, a, b) {
    this.joinArr.push({ table: table, type: type, a: a, b: b });
  }

  orderBy(field, order) {
    this.order.field = field;
    this.order.order = order;
  }

  async get(table) {
    if (this.selectArr.length === 0) {
      this.selectArr.push("*");
    }

    this.query = `SELECT ${this.selectArr.join(", ")} FROM ${table}`;
    let wherequery = "";
    let joinQuery = "";

    if (this.joinArr.length > 0) {
      this.joinArr.forEach((element) => {
        joinQuery += ` ${element.type.toUpperCase()} JOIN ${element.table} ON ${
          element.a
        } = ${element.b}`;
      });
    }
    this.query += joinQuery;

    if (this.whereArr.length > 0) {
      this.whereArr.forEach((element, index) => {
        wherequery +=
          index === 0
            ? ` WHERE ${element.key} ${element.operator} ?`
            : ` AND ${element.key} ${element.operator} ?`;
      });
    }
    this.query += wherequery;

    if (this.order.field) {
      this.query += ` ORDER BY ${this.order.field} ${this.order.order}`;
    }

    if (this.group_By != "") {
      this.query += ` GROUP BY ${this.group_By}`;
    }

    try {
      const [rows] = await database.promise().query(
        this.query,
        this.whereArr.map((w) => w.value)
      );

      this.selectArr = [];
      this.whereArr = [];
      this.joinArr = [];
      this.order = { field: "", order: "ASC" };

      return rows;
    } catch (err) {
      throw err;
    }
  }

  async insert(table, data) {
    try {
      const [result] = await database
        .promise()
        .query("INSERT INTO ?? SET ?", [table, data]);
      return result;
    } catch (err) {
      throw err;
    }
  }

  async update(table, data) {
    this.query = `UPDATE ${table} SET ?`;
    let wherequery = ``;

    if (this.whereArr.length > 0) {
      this.whereArr.forEach((element, index) => {
        wherequery +=
          index === 0
            ? ` WHERE ${element.key} ${element.operator} ?`
            : ` AND ${element.key} ${element.operator} ?`;
      });
    }
    this.query += wherequery;

    try {
      const [result] = await database
        .promise()
        .query(this.query, [data, ...this.whereArr.map((w) => w.value)]);

      this.selectArr = [];
      this.whereArr = [];
      this.joinArr = [];
      this.order = { field: "", order: "ASC" };
      this.query = ``;

      return result;
    } catch (err) {
      throw err;
    }
  }

  async delete(table) {
    this.query = `DELETE FROM ${table}`;
    let wherequery = ``;

    if (this.whereArr.length > 0) {
      this.whereArr.forEach((element, index) => {
        wherequery +=
          index === 0
            ? ` WHERE ${element.key} ${element.operator} ?`
            : ` AND ${element.key} ${element.operator} ?`;
      });
    }
    this.query += wherequery;

    try {
      const [result] = await database.promise().query(
        this.query,
        this.whereArr.map((w) => w.value)
      );

      this.selectArr = [];
      this.whereArr = [];
      this.joinArr = [];
      this.order = { field: "", order: "ASC" };
      this.query = ``;

      return result;
    } catch (err) {
      throw err;
    }
  }

  async whereOr(table, orConditions) {
    try {
      if (this.selectArr.length === 0) {
        this.selectArr.push("*");
      }

      const whereClause = orConditions
        .map((cond) => {
          return (
            "(" +
            Object.entries(cond)
              .map(([key, val]) =>
                val === null ? `${key} IS NULL` : `${key} = ?`
              )
              .join(" AND ") +
            ")"
          );
        })
        .join(" OR ");

      const values = orConditions.flatMap((cond) =>
        Object.values(cond).filter((v) => v !== null)
      );

      const query = `SELECT ${this.selectArr.join(
        ", "
      )} FROM ${table} WHERE ${whereClause}`;

      const [rows] = await database.promise().query(query, values);

      return rows;
    } catch (err) {
      throw err;
    }
  }

  async alter(table) {
    try {
      const [result] = await database
        .promise()
        .query(`ALTER TABLE ${table} AUTO_INCREMENT=1`);
      return result;
    } catch (err) {
      throw err;
    }
  }

  viewQuery() {
    return this.query;
  }
}

module.exports = Crud;

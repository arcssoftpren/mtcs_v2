const crud = require("../helpers/crud");
const { crypter } = require("../helpers/crypter");
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");

module.exports = {
  login: async (req, res) => {
    try {
      const data = req.body;
      const { userNik, userPassword } = data;
      const db = new crud();
      db.join("left", "t_role", "t_role.roleId", "t_user.roleId");
      db.where("userNik", "=", userNik);
      const found = await db.get("t_user");
      if (found.length < 1) {
        throw {
          text: "User not found",
          title: "Not Found",
          icon: "error",
        };
      }

      const hash = found[0].userPassword;
      const dehash = crypter.decryptText(hash);
      const valid = dehash === userPassword;
      if (!valid) {
        throw {
          text: "Invalid password",
          title: "Authentication Failed",
          icon: "error",
        };
      }

      delete found[0].userPassword; // Hapus password dari hasil
      return res.status(200).json(found[0]);
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  },
  getUserData: async (req, res) => {
    try {
      const data = req.body;
      const { userId } = data;
      const db = new crud();
      db.where("userId", "=", userId);
      db.join("left", "t_role", "t_role.roleId", "t_user.roleId");
      const user = await db.get("t_user");
      if (!user) {
        throw {
          text: "User not found",
          title: "Not Found",
          icon: "error",
        };
      }
      return res.status(200).json(user[0]);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  },
  addRole: async (req, res) => {
    try {
      const data = req.body;
      const db = new crud();
      db.where("roleName", "=", data.roleName);
      const dupe = await db.get("t_role");
      if (dupe.length > 0) {
        return res.status(400).json({
          text: "Role already exists",
          title: "Duplicate Role",
          icon: "error",
        });
      }

      const db2 = new crud();
      const roleId = await db2.insert("t_role", data);
      return res.status(200).json({ roleId });
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  },
  getRoles: async (req, res) => {
    try {
      const db = new crud();
      // db.where("roleId", "!=", 1); // Exclude admin role
      const roles = await db.get("t_role");
      return res.status(200).json(roles);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  },
  editRole: async (req, res) => {
    try {
      const data = req.body;
      const db = new crud();
      db.where("roleId", "!=", data.roleId);
      db.where("roleName", "=", data.roleName);
      const dupe = await db.get("t_role");
      if (dupe.length > 0) {
        return res.status(400).json({
          text: "Role name already used by another role",
          title: "Duplicate Role",
          icon: "error",
        });
      }

      const db2 = new crud();
      db2.where("roleId", "=", data.roleId);
      const updated = await db2.update("t_role", data);
      if (updated.affectedRows < 1) {
        throw {
          text: "Failed to update role",
          title: "Update Failed",
          icon: "error",
        };
      }
      return res.status(200).json({ message: "Role updated successfully" });
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  },
  deleteRole: async (req, res) => {
    try {
      const { roleId } = req.body;
      const db = new crud();
      db.where("roleId", "=", roleId);
      const deleted = await db.delete("t_role");
      if (deleted.affectedRows < 1) {
        throw {
          text: "Failed to delete role",
          title: "Delete Failed",
          icon: "error",
        };
      }
      return res.status(200).json({ message: "Role deleted successfully" });
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  },
  createUser: async (req, res) => {
    try {
      const data = req.body;
      const file = req.files;
      const { userNik, userPassword } = data;
      const db = new crud();
      db.where("userNik", "=", userNik);
      const dupe = await db.get("t_user");
      if (dupe.length > 0) {
        return res.status(400).json({
          text: "User NIK already exists",
          title: "Duplicate User",
          icon: "error",
        });
      }

      const hash = crypter.encryptText(userPassword);
      data.userPassword = hash;
      const db2 = new crud();
      const userId = await db2.insert("t_user", data);

      if (req.files && Object.keys(req.files).length > 0) {
        const uploadedFile = req.files.signFile;
        const filePath = path.join(
          __dirname,
          "../uploads/signs/",
          `${userId.insertId}_signature.png`
        );
        uploadedFile.mv(filePath, function (err) {
          if (err) {
            throw {
              title: "Upload Error",
              text: "the file is not uploaded, please try again!",
              icon: "error",
              timer: 3000,
            };
          }
          return res.status(200).json({ message: "success" });
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  },
  getUsers: async (req, res) => {
    try {
      const db = new crud();
      db.join("left", "t_role", "t_role.roleId", "t_user.roleId");
      let users = await db.get("t_user");
      users = users.map((user) => {
        delete user.userPassword;
        return user;
      });

      users = users.filter((user) => user.roleId !== 1); // Filter out admin users
      return res.status(200).json(users);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  },
  editUser: async (req, res) => {
    try {
      const data = req.body;
      const file = req.files;
      const { userId, userNik, userPassword } = data;

      const db = new crud();
      db.where("userNik", "=", userNik);
      db.where("userId", "!=", userId);
      const dupe = await db.get("t_user");
      if (dupe.length > 0) {
        return res.status(400).json({
          text: "User NIK already exists",
          title: "Duplicate User",
          icon: "error",
        });
      }

      if (userPassword) {
        data.userPassword = crypter.encryptText(userPassword);
      } else {
        delete data.userPassword; // Do not update password if not provided
      }

      const db2 = new crud();
      db2.where("userId", "=", userId);
      const updated = await db2.update("t_user", data);

      if (file && Object.keys(file).length > 0) {
        const uploadedFile = file.signFile;
        const filePath = path.join(
          __dirname,
          "../uploads/signs/",
          `${userId}_signature.png`
        );
        uploadedFile.mv(filePath, function (err) {
          if (err) {
            throw {
              title: "Upload Error",
              text: "The file is not uploaded, please try again!",
              icon: "error",
              timer: 3000,
            };
          }
          return res.status(200).json({ message: "User updated successfully" });
        });
      } else {
        return res.status(200).json({ message: "User updated successfully" });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  },
  getSignFile: async (req, res) => {
    try {
      const { userId } = req.body;
      const db = new crud();
      db.where("userId", "=", userId);
      const dupe = await db.get("t_user");

      if (dupe.length < 1)
        throw {
          title: "Unknown User",
          text: "There is no account related to the submitted data.",
          icon: "error",
        };

      const filePath = `./uploads/signs/${userId}_signature.png`;

      let fileData;

      // Pakai promises

      try {
        fileData = await fs.promises.readFile(filePath);
      } catch (err) {
        throw {
          title: "File Not Found",
          text: "There is no signature file related to the account, please add new file.",
          icon: "error",
        };
      }

      const mimeType = mime.lookup(filePath) || "application/octet-stream";
      const base64 = fileData.toString("base64");
      const dataUrl = `data:${mimeType};base64,${base64}`;

      return res.status(200).json(dataUrl);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  },
  deleteUser: async (req, res) => {
    try {
      const { userId } = req.body;
      const db = new crud();
      db.where("userId", "=", userId);
      const deleted = await db.delete("t_user");

      if (deleted) {
        return res.status(200).json({ message: "User deleted successfully" });
      } else {
        throw {
          title: "Delete Error",
          text: "Failed to delete user, please try again.",
          icon: "error",
        };
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  },
};

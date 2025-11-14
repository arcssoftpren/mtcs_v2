const crud = require("../helpers/crud");
const { crypter } = require("../helpers/crypter");
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");
const { InspectionReport } = require("../helpers/helpers_2");
const moment = require("moment");
const e = require("express");
const axios = require("axios");

module.exports = {
  createHeader: async (req, res) => {
    try {
      const data = req.body;
      const db = new crud();
      const { label, objectType, id } = data;

      const newHeader = {
        label,
        objectType,
      };

      if (!id) {
        const result = await db.insert("headers", newHeader);
      } else {
        db.where("id", "=", id);
        const result = await db.update("headers", newHeader);
      }

      return res.status(200).json({});
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  },
  deleteHeader: async (req, res) => {
    try {
      const { id } = req.body;
      const db = new crud();
      db.where("id", "=", id);
      const result = await db.delete("headers");
      return res.status(200).json({});
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  },
  getHeaders: async (req, res) => {
    try {
      const db = new crud();
      let headers = await db.get("headers");

      headers = headers.map((key, index) => {
        key.no = index + 1;
        return key;
      });

      return res.status(200).json(headers);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  },
  getInspections: async (req, res) => {
    try {
      const { func } = req.body;
      const db = new crud();
      db.select("*");
      db.select("inspections.status as status");
      db.where("inspections.status", "=", func);
      db.where("fullDate", "=", moment().format("YYYY-MM-DD"));
      db.join("left", "tools", "tools.toolId", "inspections.toolId");
      let inspections = await db.get("inspections");

      inspections = inspections.map((inspection, index) => {
        inspection.no = index + 1;
        inspection.inspector = JSON.parse(inspection.inspector);
        inspection.inspectionItems = JSON.parse(inspection.inspectionItems);
        let data = {
          insId: inspection.insId,
          no: inspection.no,
          inspector: inspection.inspector,
          inspectionItems: inspection.inspectionItems,
          regisNo: JSON.parse(inspection.headerData).regisNo,
          equipmentName: JSON.parse(inspection.headerData).equipmentName,
          date: inspection.date,
          month: inspection.month,
          week: inspection.week,
          fullDate: inspection.fullDate,
          year: inspection.year,
          status: inspection.status,
          toolId: inspection.toolId,
        };
        return data;
      });

      return res.status(200).json(inspections);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  },
  createToolRank: async (req, res) => {
    try {
      const data = req.body;
      const db = new crud();
      const { label, headers, id } = data;

      if (!id) {
        const newToolRank = {
          label,
          headers,
        };

        const result = await db.insert("ranks", newToolRank);
        return res.status(200).json(result);
      } else {
        db.where("id", "=", id);
        const result = await db.update("ranks", { label, headers });
        return res.status(200).json(result);
      }
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  },

  deleteRank: async (req, res) => {
    try {
      const { id } = req.body;
      const db = new crud();
      db.where("id", "=", id);
      const result = await db.delete("ranks");
      return res.status(200).json({});
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  },

  createType: async (req, res) => {
    try {
      const data = req.body;
      const db = new crud();
      const { label, id } = data;

      if (!id) {
        const newType = { label };
        const result = await db.insert("types", newType);
        return res.status(200).json(result);
      } else {
        db.where("id", "=", id);
        const result = await db.update("types", { label });
        return res.status(200).json(result);
      }
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  },

  deleteType: async (req, res) => {
    try {
      const { id } = req.body;
      const db = new crud();
      db.where("id", "=", id);
      const result = await db.delete("types");
      return res.status(200).json({});
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  },

  getTypes: async (req, res) => {
    try {
      const db = new crud();
      let types = await db.get("types");

      types = types.map((type, index) => {
        type.no = index + 1;
        return type;
      });

      return res.status(200).json(types);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  },

  getRanks: async (req, res) => {
    try {
      const db = new crud();
      let ranks = await db.get("ranks");

      ranks = ranks.map((rank, index) => {
        rank.no = index + 1;
        rank.headers = JSON.parse(rank.headers);
        return rank;
      });

      return res.status(200).json(ranks);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  },

  deleteInspection: async (req, res) => {
    try {
      const { insId } = req.body;
      const db = new crud();
      db.where("insId", "=", insId);
      const result = await db.delete("inspections");
      return res.status(200).json({});
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  },

  getLogics: async (req, res) => {
    try {
      const db = new crud();
      let logics = await db.get("inspection_logic");

      logics = logics.map((logic, index) => {
        logic.no = index + 1;
        return logic;
      });

      return res.status(200).json(logics);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  },

  addTool: async (req, res) => {
    try {
      const { data } = req.body;
      const db = new crud();
      const { toolId, rank, headerData, inspectionItems, status } =
        JSON.parse(data);

      const newTool = {
        toolId,
        rank,
        headerData,
        inspectionItems,
        status,
      };

      const db2 = new crud();

      if (toolId == "") {
        const result = await db.insert("tools", newTool);

        if (req.files && Object.keys(req.files).length > 0) {
          const uploadedFile = req.files.file;
          const filePath = path.join(
            __dirname,
            "../uploads/tools/",
            `${result.insertId}_image.png`
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
      } else {
        db.where("toolId", "=", toolId);
        const result = await db.update("tools", newTool);

        if (req.files && Object.keys(req.files).length > 0) {
          const uploadedFile = req.files.file;
          const filePath = path.join(
            __dirname,
            "../uploads/tools/",
            `${toolId}_image.png`
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
      }
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  },

  getTools: async (req, res) => {
    try {
      const db = new crud();
      let tools = await db.get("tools");

      tools = tools.map((tool, index) => {
        tool.no = index + 1;
        tool.rank = JSON.parse(tool.rank);
        tool.headerData = JSON.parse(tool.headerData);
        tool.inspectionItems = JSON.parse(tool.inspectionItems);
        return tool;
      });

      return res.status(200).json(tools);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  },

  getToolsImages: async (req, res) => {
    try {
      const { toolId } = req.body;

      const filePath = `./uploads/tools/${toolId}_image.png`;

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

  deleteTool: async (req, res) => {
    try {
      const { toolId } = req.body;
      const db = new crud();
      db.where("toolId", "=", toolId);
      await db.delete("tools");
      return res.status(200).json({ message: "success" });
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  },
  generateInspection: async (req, res) => {
    try {
      const { toolId } = req.body;
      const db = new crud();

      if (toolId) {
        db.where("toolId", "=", toolId);
        const tools = await db.get("tools");

        const tool = tools[0];

        const toolData = {
          toolId: tool.toolId,
          inspectionItems: JSON.parse(tool.inspectionItems),
        };

        const inspection = new InspectionReport();
        inspection.init(toolData);

        const insert = new crud();
        await insert.insert("inspections", inspection.genData());
        return res.status(200).json({});
      } else {
        await this.genBatch();
        return res.status(200).json({});
      }
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  },
  updateInspection: async (req, res) => {
    try {
      const data = req.body;
      const db = new crud();
      db.where("insId", "=", data.insId);
      await db.update("inspections", data);
      return res.status(200).json({ message: "success" });
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  },

  genBatch: async () => {
    try {
      const db = new crud();
      db.where("status", "=", "active");
      const tools = await db.get("tools");
      function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }

      for (const tool of tools) {
        const toolData = {
          toolId: tool.toolId,
          inspectionItems: JSON.parse(tool.inspectionItems),
        };

        const inspection = new InspectionReport();
        inspection.init(toolData);

        const insert = new crud();
        await insert.insert("inspections", inspection.genData());

        await delay(1000); // delay 1 detik sebelum iterasi berikutnya
      }
    } catch (error) {
      const db = new crud();
    }
  },

  genBatch_leader: async (req, res) => {
    try {
      const daysInMonth = moment().daysInMonth();
      let n = 1;
      let weekLength = 7;
      let ind = 0;
      let weeksDate = [];

      for (let i = 1; i <= daysInMonth; i++) {
        if (n > weekLength) {
          n = 1;
          ind++;
        }
        weeksDate[ind] = weeksDate[ind] || [];
        weeksDate[ind].push(moment().date(i).format("YYYY-MM-DD"));
        n++;
      }

      const dates = weeksDate.find((week) =>
        week.includes(moment().format("YYYY-MM-DD"))
      );

      const dbTool = new crud();
      const dbInspection = new crud();

      dbInspection.where("month", "=", moment().format("MM"));
      dbInspection.where("year", "=", moment().format("YYYY"));
      let inspections = await dbInspection.get("inspections");

      dbTool.where("status", "=", "active");
      let tools = await dbTool.get("tools");

      tools = await Promise.all(
        tools.map(async (tool) => {
          const data = {
            dates: JSON.stringify(dates),
            toolId: tool.toolId,
            regisNo: JSON.parse(tool.headerData).regisNo,
            equipmentName: JSON.parse(tool.headerData).equipmentName,
            location: JSON.parse(tool.headerData).place,
            month: moment().format("MM"),
            inspectionItems: JSON.stringify(
              JSON.parse(tool.inspectionItems).map((item) => {
                return {
                  imageNumber: item.imageNumber,
                  label: item.label,
                  id: item.id,
                  methods: item.methods.map((method) => {
                    return {
                      label: method.label,
                      id: method.id,
                    };
                  }),
                };
              })
            ),
            inspectionData: JSON.stringify(
              await Promise.all(
                dates.map(async (date) => {
                  let liburs = await axios.get(
                    `https://dayoffapi.vercel.app/api?month=${moment(
                      date
                    ).format("MM")}&year=${moment(date).format("YYYY")}`
                  );

                  let libur = liburs.data.find(
                    (libur) =>
                      libur.tanggal === moment(date).format("YYYY-MM-DD")
                  );

                  let weekEnd =
                    moment(date).format("dddd").toLowerCase() == "sunday" ||
                    moment(date).format("dddd").toLowerCase() == "saturday";
                  // || moment(date)
                  //   .endOf("week")
                  //   .subtract(1, "day")
                  //   .format("YYYY-MM-DD") === moment(date).format("YYYY-MM-DD");

                  let inspection = inspections.find(
                    (ins) =>
                      ins.toolId === tool.toolId &&
                      moment(ins.fullDate).isSame(date)
                  );
                  if (inspection) {
                    inspection.inspectionItems = JSON.parse(
                      inspection.inspectionItems
                    );

                    inspection.inspector = JSON.parse(inspection.inspector);
                    inspection.fullDate = moment(inspection.fullDate).format(
                      "YYYY-MM-DD"
                    );
                  }
                  return {
                    libur: libur ? libur : null,
                    inspection: inspection ? inspection : null,
                    weekEnd: weekEnd,
                  };
                })
              )
            ),
          };
          const insertDb = new crud();
          await insertDb.insert("leaderreports", data);
          return data;
        })
      );

      if (res) {
        return res.status(200).json(tools);
      }
    } catch (error) {
      console.log(error);
      if (res) {
        return res.status(400).json(error);
      }
    }
  },

  genBatch_leader_nosave: async (req, res) => {
    try {
      const daysInMonth = moment().daysInMonth();
      let n = 1;
      let weekLength = 7;
      let ind = 0;
      let weeksDate = [];

      for (let i = 1; i <= daysInMonth; i++) {
        if (n > weekLength) {
          n = 1;
          ind++;
        }
        weeksDate[ind] = weeksDate[ind] || [];
        weeksDate[ind].push(moment().date(i).format("YYYY-MM-DD"));
        n++;
      }

      const dates = weeksDate.find((week) =>
        week.includes(moment().format("YYYY-MM-DD"))
      );

      const index = weeksDate.findIndex((week) =>
        week.includes(moment().format("YYYY-MM-DD"))
      );

      const dbTool = new crud();
      const dbInspection = new crud();

      dbInspection.where("month", "=", moment().format("MM"));
      dbInspection.where("year", "=", moment().format("YYYY"));
      let inspections = await dbInspection.get("inspections");

      dbTool.where("status", "=", "active");
      let tools = await dbTool.get("tools");
      const month = moment().format("MM");
      const year = moment().format("YYYY");

      tools = await Promise.all(
        tools.map(async (tool) => {
          const data = {
            id: `${tool.toolId}-${year}${month}${index}`,
            week: index,
            dates: dates,
            year,
            toolId: tool.toolId,
            regisNo: JSON.parse(tool.headerData).regisNo,
            equipmentName: JSON.parse(tool.headerData).equipmentName,
            location: JSON.parse(tool.headerData).place,
            month,
            inspectionItems: JSON.parse(tool.inspectionItems).map((item) => {
              return {
                imageNumber: item.imageNumber,
                label: item.label,
                id: item.id,
                methods: item.methods.map((method) => {
                  return {
                    label: method.label,
                    id: method.id,
                  };
                }),
              };
            }),
            inspectionData: await Promise.all(
              dates.map(async (date) => {
                let liburs = await axios.get(
                  `https://dayoffapi.vercel.app/api?month=${moment(date).format(
                    "MM"
                  )}&year=${moment(date).format("YYYY")}`
                );

                let libur = liburs.data.find(
                  (libur) => libur.tanggal === moment(date).format("YYYY-MM-DD")
                );

                let weekEnd =
                  moment(date).format("dddd").toLowerCase() == "sunday" ||
                  moment(date).format("dddd").toLowerCase() == "saturday";
                // || moment(date)
                //   .endOf("week")
                //   .subtract(1, "day")
                //   .format("YYYY-MM-DD") === moment(date).format("YYYY-MM-DD");

                let inspection = inspections.find(
                  (ins) =>
                    ins.toolId === tool.toolId &&
                    moment(ins.fullDate).isSame(date)
                );
                if (inspection) {
                  inspection.inspectionItems = JSON.parse(
                    inspection.inspectionItems
                  );

                  inspection.inspector = JSON.parse(inspection.inspector);
                  inspection.fullDate = moment(inspection.fullDate).format(
                    "YYYY-MM-DD"
                  );
                }
                return {
                  libur: libur ? libur : null,
                  inspection: inspection ? inspection : null,
                  weekEnd: weekEnd,
                };
              })
            ),
          };
          const insertDb = new crud();
          // await insertDb.insert("leaderreports", data);
          return data;
        })
      );

      const filterResults = await Promise.all(
        tools.map(async (tool) => {
          const db = new crud();
          db.where("toolId", "=", tool.toolId);
          db.where("id", "=", tool.id);
          const res = await db.get("leaderreports");
          return res.length < 1; // changed < 0 to < 1, as length < 0 is always false
        })
      );
      tools = tools.filter((_, idx) => filterResults[idx]);
      if (res) {
        return res.status(200).json(tools);
      }
    } catch (error) {
      console.log(error);
      if (res) {
        return res.status(400).json(error);
      }
    }
  },

  getReports: async (req, res) => {
    try {
      const { func } = req.body;
      const db = new crud();
      db.where("status", "=", func);
      let reports = await db.get("leaderreports");
      reports = await Promise.all(
        reports.map(async (report, index) => {
          report.no = index + 1;
          report.inspectionItems = JSON.parse(report.inspectionItems);
          report.dates = JSON.parse(report.dates);
          report.inspectionData = JSON.parse(report.inspectionData);
          return report;
        })
      );
      return res.status(200).json(reports);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  },
  confirmReport: async (req, res) => {
    try {
      let data = req.body;

      data.inspectionItems = JSON.stringify(data.inspectionItems);
      data.inspectionData = JSON.stringify(data.inspectionData);
      data.inspector = JSON.stringify(data.inspector);
      data.dates = JSON.stringify(data.dates);
      data.checkDate = moment().format("YYYY-MM-DD");

      const db = new crud();
      await db.insert("leaderreports", { ...data, status: "confirmed" });
      return res.status(200).json({ message: "Report confirmed" });
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  },
  genBatch_spv: async (req, res) => {
    try {
      const month = moment().format("MM");
      const year = moment().format("YYYY");
      const dbTool = new crud();
      const dbInspection = new crud();
      const dbReport = new crud();
      dbTool.where("status", "=", "active");
      let tools = await dbTool.get("tools");
      dbReport.where("month", "=", month);
      dbReport.where("year", "=", year);
      const reports = await dbReport.get("leaderreports");

      const daysInMonth = moment().daysInMonth();
      let n = 1;
      let weekLength = 7;
      let ind = 0;
      let weeksDate = [];

      for (let i = 1; i <= daysInMonth; i++) {
        if (n > weekLength) {
          n = 1;
          ind++;
        }
        weeksDate[ind] = weeksDate[ind] || [];
        weeksDate[ind].push(moment().date(i).format("YYYY-MM-DD"));
        n++;
      }

      tools = await Promise.all(
        tools.map(async (tool) => {
          let data = {
            toolId: tool.toolId,
            regisNo: JSON.parse(tool.headerData).regisNo,
            equipmentName: JSON.parse(tool.headerData).equipmentName,
            location: JSON.parse(tool.headerData).place,
            rank: JSON.parse(tool.rank).label,
            month,
            year,
            reports: await Promise.all(
              weeksDate.map(async (week, index) => {
                let myReport = reports.find(
                  (report) =>
                    report.week == index && report.toolId == tool.toolId
                );
                if (myReport) {
                  let data = {
                    ...myReport,
                  };
                  data.inspectionItems = JSON.parse(myReport.inspectionItems);
                  data.inspectionData = JSON.parse(myReport.inspectionData);
                  data.dates = JSON.parse(myReport.dates);
                  data.inspector = JSON.parse(myReport.inspector);
                  return data;
                } else {
                  dbInspection.where("month", "=", moment().format("MM"));
                  dbInspection.where("year", "=", moment().format("YYYY"));
                  let inspections = await dbInspection.get("inspections");
                  const data = {
                    week: index,
                    dates: week,
                    year,
                    toolId: tool.toolId,
                    regisNo: JSON.parse(tool.headerData).regisNo,
                    equipmentName: JSON.parse(tool.headerData).equipmentName,
                    location: JSON.parse(tool.headerData).place,
                    month,
                    inspectionItems: JSON.parse(tool.inspectionItems).map(
                      (item) => {
                        return {
                          imageNumber: item.imageNumber,
                          label: item.label,
                          id: item.id,
                          methods: item.methods.map((method) => {
                            return {
                              label: method.label,
                              id: method.id,
                            };
                          }),
                        };
                      }
                    ),
                    inspectionData: await Promise.all(
                      week.map(async (date) => {
                        let liburs = await axios.get(
                          `https://dayoffapi.vercel.app/api?month=${moment(
                            date
                          ).format("MM")}&year=${moment(date).format("YYYY")}`
                        );

                        let libur = liburs.data.find(
                          (libur) =>
                            libur.tanggal === moment(date).format("YYYY-MM-DD")
                        );

                        let weekEnd =
                          moment(date).format("dddd").toLowerCase() ==
                            "sunday" ||
                          moment(date).format("dddd").toLowerCase() ==
                            "saturday";
                        // || moment(date)
                        //   .endOf("week")
                        //   .subtract(1, "day")
                        //   .format("YYYY-MM-DD") === moment(date).format("YYYY-MM-DD");

                        let inspection = inspections.find(
                          (ins) =>
                            ins.toolId === tool.toolId &&
                            moment(ins.fullDate).isSame(date)
                        );
                        if (inspection) {
                          inspection.inspectionItems = JSON.parse(
                            inspection.inspectionItems
                          );

                          inspection.inspector = JSON.parse(
                            inspection.inspector
                          );
                          inspection.fullDate = moment(
                            inspection.fullDate
                          ).format("YYYY-MM-DD");
                        }
                        return {
                          libur: libur ? libur : null,
                          inspection: inspection ? inspection : null,
                          weekEnd: weekEnd,
                        };
                      })
                    ),
                  };
                  return data;
                }
              })
            ),

            inspectionItems: JSON.parse(tool.inspectionItems).map((item) => {
              return {
                imageNumber: item.imageNumber,
                label: item.label,
                id: item.id,
                methods: item.methods.map((method) => {
                  return {
                    label: method.label,
                    id: method.id,
                  };
                }),
              };
            }),
          };
          return data;
        })
      );

      if (res) {
        return res.status(200).json(tools);
      }
    } catch (error) {
      console.log(error);
      if (res) {
        return res.status(400).json(error);
      }
    }
  },
  getDocNum: async (req, res) => {
    try {
      const { id } = req.body;
      const db = new crud();
      db.where("id", "=", id);
      const docnum = await db.get("docnum");
      return res.status(200).json(docnum[0].val);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  },
};

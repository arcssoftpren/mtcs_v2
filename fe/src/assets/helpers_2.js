import moment from 'moment';

// Enum untuk logicType agar lebih readable
const LOGIC_TYPE = {
  OK_NG: 1,
  RANGE: 2,
  GREATER: 3,
  LESS: 4,
  TARGET_LIMIT: 5,
  GREATER_EQUAL: 6,
  LESS_EQUAL: 7,
  MATCH_TEXT: 8,
  MATCH_NUMBER: 9,
  NOT_EQUAL: 10,
  CUSTOM_OK_NG: 16,
  TARGET_TOL: 17,
};
const standardMeta = {
  1: [{ label: 'Standard', operator: '=' }],
  2: [
    { label: 'Min', operator: '≥' },
    { label: 'Max', operator: '≤' },
  ],
  3: [{ label: 'Target', operator: '>' }],
  4: [{ label: 'Target', operator: '<' }],
  5: [
    { label: 'Target', operator: '' },
    { label: '+X', operator: '+' },
    { label: '-X', operator: '-' },
  ],
  6: [{ label: 'Target', operator: '≥' }],
  7: [{ label: 'Target', operator: '≤' }],
  8: [{ label: 'Text', operator: '=' }],
  9: [{ label: 'Number', operator: '=' }],
  10: [{ label: 'Not Equal', operator: '≠' }],
  16: [{ label: 'Standard', operator: '=' }],
  17: [
    { label: 'Target', operator: '' },
    { label: 'Tolerance', operator: '±' },
  ],
};
class Tool {
  constructor() {
    this.toolId = '';
    this.rank = '';
    this.headerData = {};
    this.inspectionItems = [];
    this.status = 'active';
  }

  // Tambah satu inspection item jika belum ada berdasarkan fullDate
  addInspectionItem(item) {
    this.inspectionItems.push(item);
  }

  setFromObj(obj) {
    Object.assign(this, obj);
  }

  // Hapus satu inspection item berdasarkan fullDate
  removeInspectionItem(item) {
    this.inspectionItems = this.inspectionItems.filter((i) => i.id !== item.id);
  }

  init(rank, headers) {
    this.rank = rank;
    let arr = [[17, 18, 19, 26, 24], []];

    headers.forEach((header) => {
      this.headerData[header.header_key] = this.headerData[header.header_key]
        ? this.headerData[header.header_key]
        : '';
    });

    arr[1] = rank.headers.filter((header) => !arr[0].includes(header));

    arr = arr.map((section) => {
      section = section.map((id) => {
        let headerKey = headers.find((h) => h.id === id);
        return headerKey;
      });
      return section;
    });
    return arr;
  }

  generateData() {
    return {
      toolId: this.toolId,
      rank: JSON.stringify(this.rank),
      headerData: JSON.stringify(this.headerData),
      inspectionItems: JSON.stringify(this.inspectionItems),
      status: this.status,
    };
  }
}

class InspectionReport {
  constructor() {
    this.insId = '';
    this.toolId = '';
    this.date = '';
    this.week = '';
    this.month = '';
    this.year = '';
    this.fullDate = moment().format('YYYY-MM-DD');
    this.inspector = {
      userName: '',
      userId: '',
    };
    this.inspectionItems = [];
    this.status = 'unchecked';
  }

  init(tool) {
    this.toolId = tool.toolId;
    tool.inspectionItems.forEach((item) => {
      this.inspectionItems.push(item);
    });

    this.date = moment(this.fullDate).format('DD');
    this.week = moment(this.fullDate).format('GGGG-W');
    this.month = moment(this.fullDate).format('MM');
    this.year = moment(this.fullDate).format('YYYY');
  }

  genData() {
    return {
      insId: this.insId,
      toolId: this.toolId,
      date: this.date,
      week: this.week,
      month: this.month,
      year: this.year,
      fullDate: moment(this.fullDate).format('YYYY-MM-DD'),
      inspector: JSON.stringify(this.inspector),
      inspectionItems: JSON.stringify(this.inspectionItems),
      status: this.status,
    };
  }

  setFromObj(obj) {
    Object.assign(this, obj);
    this.inspectionItems = this.inspectionItems.map((item) => {
      let newItem = new InspectionItem();
      newItem.setFromObj(item);

      newItem.methods = newItem.methods.map((method) => {
        let newMethod = new InspectionMethod();
        newMethod.setFromObj(method);
        return newMethod;
      });
      return newItem;
    });
  }

  getResult() {
    let valid = this.inspectionItems.every((item) => {
      let result = [];

      item.methods.forEach((method) => {
        let m = new InspectionMethod();
        m.setFromObj(method);
        result.push(m.inspect());
      });
      return result.every((res) => res === true);
    });
    this.status = valid ? 'checked' : 'abnormal';
    return valid;
  }
}

class InspectionItem {
  constructor() {
    this.id = moment().format('YYYYMMDDHHmmssms');
    this.label = '';
    this.imageNumber = 0;
    this.methods = [];
  }

  // Tambah satu method inspeksi
  addMethod(method) {
    this.methods.push(method);
  }

  removeMethod(method) {
    this.methods = this.methods.filter((item) => item.id !== method.id);
  }

  getResult() {
    return this.methods.every((method) => method.inspect());
  }

  // Kembalikan data mentah InspectionItem
  genData() {
    return {
      id: this.id,
      label: this.label,
      imageNumber: this.imageNumber,
      methods: this.methods,
    };
  }

  // Buat method inspeksi baru
  initiateNewMethod() {
    return new InspectionMethod();
  }

  // Set semua property dari object
  setFromObj(obj) {
    Object.assign(this, obj);
  }
}

class InspectionMethod {
  constructor() {
    this.id = moment().format('YYYYMMDDHHmmssms');
    this.label = '';
    this.logicType = {};
    this.input = null;
    this.standard = [''];
    this.unit = '';
    this.dataType = 'number';
    this.standardString = '';
    this.standardMeta = [];
    this.judgement = false;
  }

  // Cek input terhadap standard sesuai logicType
  inspect() {
    const id = this.logicType.id;
    let input = this.input;
    let min, max, tolerance, target, upperLimit, lowerLimit;

    if (input === '' || input === null) return false;

    // Validasi input number jika perlu
    const isNumberType = [
      LOGIC_TYPE.RANGE,
      LOGIC_TYPE.GREATER,
      LOGIC_TYPE.LESS,
      LOGIC_TYPE.TARGET_LIMIT,
      LOGIC_TYPE.GREATER_EQUAL,
      LOGIC_TYPE.LESS_EQUAL,
      LOGIC_TYPE.MATCH_NUMBER,
      LOGIC_TYPE.NOT_EQUAL,
      LOGIC_TYPE.TARGET_TOL,
    ].includes(id);
    if (isNumberType) input = parseFloat(input);

    switch (id) {
      case LOGIC_TYPE.OK_NG:
        this.standard = ['OK'];
        return this.standard[0] === input;
      case LOGIC_TYPE.RANGE:
        min = parseFloat(this.standard[0]);
        max = parseFloat(this.standard[1]);
        return input >= min && input <= max;
      case LOGIC_TYPE.GREATER:
        min = parseFloat(this.standard[0]);
        return input > min;
      case LOGIC_TYPE.LESS:
        max = parseFloat(this.standard[0]);
        return input < max;
      case LOGIC_TYPE.TARGET_LIMIT:
        target = parseFloat(this.standard[0]);
        upperLimit = target + parseFloat(this.standard[1]);
        lowerLimit = target - parseFloat(this.standard[2]);
        return input >= lowerLimit && input <= upperLimit;
      case LOGIC_TYPE.GREATER_EQUAL:
        max = parseFloat(this.standard[0]);
        return input >= max;
      case LOGIC_TYPE.LESS_EQUAL:
        max = parseFloat(this.standard[0]);
        return input <= max;
      case LOGIC_TYPE.MATCH_TEXT:
        return this.standard[0].toLowerCase() === String(input).toLowerCase();
      case LOGIC_TYPE.MATCH_NUMBER:
        return parseFloat(this.standard[0]) === input;
      case LOGIC_TYPE.NOT_EQUAL:
        return parseFloat(this.standard[0]) !== input;
      case LOGIC_TYPE.CUSTOM_OK_NG:
        return 'OK' === input;
      case LOGIC_TYPE.TARGET_TOL:
        target = parseFloat(this.standard[0]);
        tolerance = parseFloat(this.standard[1]);
        return input >= target - tolerance && input <= target + tolerance;
      default:
        return false;
    }
  }

  // Kembalikan string representasi standard
  getStandardString() {
    const id = this.logicType.id;
    const unit = this.unit;
    switch (id) {
      case LOGIC_TYPE.OK_NG:
        return this.standard[0];
      case LOGIC_TYPE.RANGE:
        return `${this.standard[0]} ~ ${this.standard[1]} ${unit}`;
      case LOGIC_TYPE.GREATER:
        return `> ${this.standard[0]} ${unit}`;
      case LOGIC_TYPE.LESS:
        return `< ${this.standard[0]} ${unit}`;
      case LOGIC_TYPE.TARGET_LIMIT:
        return `${this.standard[0]}, + ${this.standard[1]} - ${this.standard[2]} ${unit}`;
      case LOGIC_TYPE.GREATER_EQUAL:
        return `≥ ${this.standard[0]} ${unit}`;
      case LOGIC_TYPE.LESS_EQUAL:
        return `≤ ${this.standard[0]} ${unit}`;
      case LOGIC_TYPE.MATCH_TEXT:
        return `${this.standard[0]} ${unit}`;
      case LOGIC_TYPE.MATCH_NUMBER:
        return `${this.standard[0]} ${unit}`;
      case LOGIC_TYPE.NOT_EQUAL:
        return `≠ ${this.standard[0]} ${unit}`;
      case LOGIC_TYPE.CUSTOM_OK_NG:
        return this.standard[0];
      case LOGIC_TYPE.TARGET_TOL:
        return `${this.standard[0]}, ±${this.standard[1]} ${unit}`;
      default:
        return '';
    }
  }

  // Generate array kosong sesuai logicType (pure function)
  generateStandardArray() {
    const id = this.logicType.id;
    switch (id) {
      case LOGIC_TYPE.OK_NG:
      case LOGIC_TYPE.GREATER:
      case LOGIC_TYPE.LESS:
      case LOGIC_TYPE.GREATER_EQUAL:
      case LOGIC_TYPE.LESS_EQUAL:
      case LOGIC_TYPE.MATCH_TEXT:
      case LOGIC_TYPE.MATCH_NUMBER:
      case LOGIC_TYPE.NOT_EQUAL:
      case LOGIC_TYPE.CUSTOM_OK_NG:
        return [''];
      case LOGIC_TYPE.RANGE:
        return ['', ''];
      case LOGIC_TYPE.TARGET_LIMIT:
        return ['', '', ''];
      case LOGIC_TYPE.TARGET_TOL:
        return ['', ''];
      default:
        return [''];
    }
  }

  // Set dataType sesuai logicType
  setDataType() {
    const id = this.logicType.id;
    switch (id) {
      case LOGIC_TYPE.OK_NG:
      case LOGIC_TYPE.CUSTOM_OK_NG:
      case LOGIC_TYPE.MATCH_TEXT:
        this.dataType = 'text';
        break;
      case LOGIC_TYPE.RANGE:
      case LOGIC_TYPE.GREATER:
      case LOGIC_TYPE.LESS:
      case LOGIC_TYPE.TARGET_LIMIT:
      case LOGIC_TYPE.GREATER_EQUAL:
      case LOGIC_TYPE.LESS_EQUAL:
      case LOGIC_TYPE.MATCH_NUMBER:
      case LOGIC_TYPE.NOT_EQUAL:
      case LOGIC_TYPE.TARGET_TOL:
        this.dataType = 'number';
        break;
      default:
        this.dataType = 'text';
    }
  }

  // Inisialisasi logicType, standard, dan dataType
  init(logic) {
    if (logic != null || logic != undefined || logic.id != undefined) {
      this.logicType = logic;
      this.standard = this.generateStandardArray();
      this.standardMeta = standardMeta[logic.id] || [];
      this.setDataType();

      if (logic.id == 1) {
        this.standard[0] = 'OK';
      }
    }
  }

  // Kembalikan data mentah InspectionMethod
  genData() {
    return {
      id: this.id,
      label: this.label,
      logicType: this.logicType,
      standard: this.standard,
      dataType: this.dataType,
      standardString: this.getStandardString(),
      unit: this.unit,
      standardMeta: this.standardMeta,
      judgement: this.inspect(),
      input: this.input,
    };
  }

  // Set semua property dari object
  setFromObj(obj) {
    Object.assign(this, obj);
  }
}

// function updateInspection() {

// }

export {
  Tool,
  InspectionReport,
  InspectionItem,
  InspectionMethod,
  LOGIC_TYPE,
  standardMeta,
};

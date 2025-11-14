// Backup of helpers_2.js before refactor
import moment from 'moment';

class Tool {
  constructor() {
    this.toolId = '';
    this.rank = '';
    this.headerData = {};
    this.abnormalReports = [];
    this.inspectionReports = [];
    this.abnormalReports = [];
    this.calibrationReports = [];
    this.inspectionItems = [];
    this.status = 'active';
  }

  addInspectionItems(item) {
    let find = this.inspectionItems.find(
      (item_) => item.fullDate === item_.fullDate
    );
    if (!find) {
      this.inspectionItems.push(item.genData());
    }
  }

  removeInspectionItems(item) {
    this.inspectionItems = this.inspectionItems.filter(
      (item_) => item_.fullDate !== item.fullDate
    );
  }

  initiateReport() {
    let report = new InspectionReport();
    this.inspectionItems.forEach((item) => {
      let item_ = new InspectionItem();
      item_.setFromObj(item);
      report.inspectionItems.push(item_);
    });
    return report;
  }
}

class InspectionReport {
  constructor() {
    this.date = '';
    this.week = '';
    this.month = '';
    this.year = '';
    this.fullDate = moment(`${this.year}-${this.month}-${this.date}`);
    this.inspector = {
      userName: '',
      userId: '',
    };
    this.inspectionItems = [];
    this.status = 'unchecked';
  }
}

class InspectionItem {
  constructor() {
    this.label = '';
    this.imageNumber = 0;
    this.methods = [];
  }

  addMethods(method) {
    this.methods.push(method.genData());
  }

  genData() {
    return {
      label: this.label,
      imageNumber: this.imageNumber,
      methods: this.methods,
    };
  }

  initiateNewMethod() {
    let method = new InspectionMethod();
    return method;
  }
}

class InspectionMethod {
  constructor() {
    this.label = '';
    this.logicType = 0;
    this.input = null;
    this.standard = [''];
    this.unit = '';
    this.dataType = 'number';
    this.standardString = '';
  }

  inspect() {
    let id = this.logicType;
    let input = this.input;

    let min;
    let max;
    let tolerance;
    let target;
    let upperLimit;
    let lowerLimit;

    if (input === '' || input === null) {
      // Handle empty input case
      return false;
    }

    switch (id) {
      case 1:
        // ok/ng
        this.standard = ['OK'];
        return this.standard[0] === input;
        break;
      case 2:
        // number range
        min = parseFloat(this.standard[0]);
        max = parseFloat(this.standard[1]);
        return input >= min && input <= max;
      case 3:
        // Larger than
        min = parseFloat(this.standard[0]);
        return input > min;
      case 4:
        // Less than
        max = parseFloat(this.standard[0]);
        return input < max;
      case 5:
        // target + upperLimit - lowerLimit
        target = parseFloat(this.standard[0]);
        upperLimit = target + parseFloat(this.standard[1]);
        lowerLimit = target - parseFloat(this.standard[2]);
        return input >= lowerLimit && input <= upperLimit;
      case 6:
        // larger equal
        max = parseFloat(this.standard[0]);
        return input >= max;
      case 7:
        // less equal
        max = parseFloat(this.standard[0]);
        return input <= max;
      case 8:
        // match text
        return this.standard[0].toLowerCase() === input.toLowerCase();
      case 9:
        // match number
        return parseFloat(this.standard[0]) === parseFloat(input);
      case 10:
        // not equal
        return parseFloat(this.standard[0]) !== parseFloat(input);
      case 16:
        //Custom OK NG
        let customStandard = 'OK';
        return customStandard === input;
      case 17:
        // target ±
        target = parseFloat(this.standard[0]);
        tolerance = parseFloat(this.standard[1]);
        return input >= target - tolerance && input <= target + tolerance;
    }
  }

  getStandardString() {
    let id = this.logicType;
    let unit = this.unit;

    switch (id) {
      case 1: // ok/ng
        return this.standard[0];
      case 2: // number range
        return `${this.standard[0]} ~ ${this.standard[1]} ${unit}`;
      case 3: // larger than
        return `> ${this.standard[0]} ${unit}`;
      case 4: // less than
        return `< ${this.standard[0]} ${unit}`;
      case 5: // target + upperLimit - lowerLimit
        return `${this.standard[0]}, + ${this.standard[1]} - ${this.standard[2]} ${unit}`;
      case 6: // larger equal
        return `≥ ${this.standard[0]} ${unit}`;
      case 7: // less equal
        return `≤ ${this.standard[0]} ${unit}`;
      case 8: // match text
        return `${this.standard[0]} ${unit}`;
      case 9: // match number
        return `${this.standard[0]} ${unit}`;
      case 10: // not equal
        return `≠ ${this.standard[0]} ${unit}`;
      case 16: // custom OK/NG
        return this.standard[0];
      case 17: // target ±
        return `${this.standard[0]}, ±${this.standard[1]} ${unit}`;
    }
  }

  generateStandardArray() {
    let id = this.logicType;
    switch (id) {
      case 1:
        this.standard = [''];
        break;
      case 2:
        this.standard = ['', ''];
        break;
      case 3:
        this.standard = [''];
        break;
      case 4:
        this.standard = [''];
        break;
      case 5:
        this.standard = ['', '', ''];
        break;
      case 6:
        this.standard = [''];
        break;
      case 7:
        this.standard = [''];
        break;
      case 8:
        this.standard = [''];
        break;
      case 9:
        this.standard = [''];
        break;
      case 10:
        this.standard = [''];
        break;
      case 16:
        this.standard = [''];
        break;
      case 17:
        this.standard = ['', ''];
        break;
    }
  }

  setDataType() {
    let id = this.logicType;
    switch (id) {
      case 1:
      case 16:
        this.dataType = 'text'; // OK/NG
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
      case 9:
      case 10:
      case 17:
        this.dataType = 'number';
      case 8:
        this.dataType = 'text';
      default:
        this.dataType = 'text';
    }
  }

  init(logic) {
    this.logicType = logic;
    this.generateStandardArray();
    this.setDataType();
  }

  genData() {
    return {
      logicType: this.logicType,
      standard: this.standard,
      dataType: this.dataType,
      standardString: this.getStandardString(),
      unit: this.unit,
    };
  }

  setFromObj(obj) {
    this.logicType = obj.logicType;
    this.standard = obj.standard;
    this.dataType = obj.dataType;
    this.unit = obj.unit;
  }
}

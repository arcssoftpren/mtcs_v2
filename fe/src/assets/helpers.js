// Metadata label dan operator untuk setiap elemen standardArr per logic
const standardMeta = {
  1: [{ label: 'Standard', operator: '=' }],
  2: [
    { label: 'Min', operator: '≥' },
    { label: 'Max', operator: '≤' },
  ],
  3: [{ label: '> Target', operator: '>' }],
  4: [{ label: '< Target', operator: '<' }],
  5: [
    { label: 'Target', operator: 'Target' },
    { label: '+X', operator: '+' },
    { label: '-X', operator: '-' },
  ],
  6: [{ label: '≥ Target', operator: '≥' }],
  7: [{ label: '≤ Target', operator: '≤' }],
  8: [{ label: 'Text', operator: '=' }],
  9: [{ label: 'Number', operator: '=' }],
  10: [{ label: 'Not', operator: '≠' }],
  16: [{ label: 'Standard', operator: '=' }],
  17: [
    { label: 'Target', operator: '±' },
    { label: 'Tolerance', operator: '±' },
  ],
};
import { useAppStore } from '@/stores/app';
const store = useAppStore();

const checkLogic = store.checkLogic;
const logicStandard = {
  1: [''],
  2: ['', ''],
  3: [''],
  4: [''],
  5: ['', '', ''],
  6: [''],
  7: [''],
  8: [''],
  9: [''],
  10: [''],
  16: [''],
  17: ['', ''],
};

const standardDataType = {
  1: 'boolean',
  2: 'number',
  3: 'number',
  4: 'number',
  5: 'number',
  6: 'number',
  7: 'number',
  8: 'text',
  9: 'number',
  10: 'number',
  16: 'text',
  17: 'number',
};

const logicInputType = {
  1: 'toggle',
  2: 'number',
  3: 'number',
  4: 'number',
  5: 'number',
  6: 'number',
  7: 'number',
  8: 'text',
  9: 'number',
  10: 'number',
  16: 'toggle',
  17: 'number',
};

class Tool {
  constructor() {
    this.toolId = '';
    this.equipment_name = '';
    this.regist_no = '';
    this.serial_no = '';
    this.registration_date = '';
    this.type = null;
    this.rank = null;
    this.insItems = [];
    this.headers = [];
  }

  initiate(rank, headers) {
    this.rank = rank;
    this.rank.headers.forEach((header) => {
      let find = headers.find((h) => h.id === header);
      if (![17, 18, 19, 25, 24, 23].includes(header)) {
        const isExist = this.headers.find((h) => h.id === header);
        if (!isExist) {
          this.headers.push({ ...find, value: '' });
        }
      }
    });

    this.headers = this.headers.filter((h) => {
      return this.rank.headers.includes(h.id);
    });
  }

  prepareInsItems() {
    let item = new InsItem();
    return item;
  }

  addInstItem(item) {
    data = {
      label: item.label,
      logic: item.logic,
      standardArr: item.standardArr,
      standard: item.standard,
      dataType: item.dataType,
    };
    this.insItems.push(data);
  }
}

class InsItem {
  constructor() {
    this.label = '';
    this.logic = null;
    this.standardArr = [''];
    this.standard = '';
    this.input = '';
    this.judgment = false;
    this.dataType = null;
    this.inputType = '';
    this.standardLabel = '';
    this.unit = '';
    this.method = null;
  }

  generateToolItem() {
    return {
      label: this.label,
      logic: toRaw(this.logic),
      standardArr: toRaw(this.standardArr),
      standard: this.standard,
      dataType: this.dataType,
      inputType: this.inputType,
    };
  }

  selectLogic() {
    this.standardArr = logicStandard[this.logic.id];
    this.dataType = standardDataType[this.logic.id];
    this.inputType = logicInputType[this.logic.id];
    this.standardLabel = standardMeta[this.logic.id];
    this.standard = '';

    if (this.logic.id === 1) {
      this.standardArr = ['OK'];
    }
  }

  validate() {
    let customValidation = true;
    if (this.logic != null) {
      if (this.logic.id == 2) {
        customValidation = this.standardArr[1] > this.standardArr[0];
      }
    }
    return (
      this.standardArr.every((item) => item !== null && item !== '') &&
      this.label !== '' &&
      this.logic !== null &&
      customValidation
    );
  }

  generateStandard() {
    this.standard = `${checkLogic(
      this.logic.id,
      this.standardArr,
      this.input,
      true
    )} ${this.unit}`;
  }

  judge() {
    this.judgment = checkLogic(this.logic.id, this.standardArr, this.input);
  }

  setinput(input) {
    this.input = input;
    this.judge();
  }
}

class Inspection {
  constructor() {
    this.insId = '';
    this.items = [];
    this.toolId = '';
    this.inspectionDate = '';
    this.inspector = '';
    this.judgment = false;
  }

  registerTool(toolData) {
    let { insItems, toolId } = toolData;
    insItems.forEach((item) => {
      // Pastikan item adalah instance InsItem
      if (item instanceof InsItem) {
        this.items.push(item);
      } else {
        this.items.push(InsItem.fromJSON(item));
      }
    });
  }
}

export { Tool, InsItem, Inspection, standardMeta };

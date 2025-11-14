// Utilities
import { defineStore } from 'pinia';
import $ from 'jquery';
import swal from 'sweetalert2';
import router from '@/router';

export const useAppStore = defineStore('app', {
  persist: {
    pick: ['theme', 'userData', 'loged'],
  },
  state: () => ({
    //
    theme: 'light',
    loged: false,
    preload: false,
    apiServer: `http://${import.meta.env.VITE_SERVER_IP}:${
      import.meta.env.VITE_SERVER_PORT
    }`,
    swal: swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = swal.stopTimer;
        toast.onmouseleave = swal.resumeTimer;
      },
      customClass: {
        container: 'swal-custom-zindex',
      },
    }),
    userData: {},

    pages: [
      {
        id: 1,
        path: '/setup/role',
        name: 'Role Setup',
        type: 'setup',
        icon: 'mdi-shield-key',
        desc: 'Manage user roles and permissions',
      },
      {
        id: 3,
        path: '/setup/user',
        name: 'User Setup',
        type: 'setup',
        icon: 'mdi-account',
        desc: 'Manage user accounts and settings',
      },
      {
        id: 4,
        path: '/setup/tools',
        name: 'Tools Setup',
        type: 'setup',
        icon: 'mdi-tools',
        desc: 'Manage measurement tools',
      },
      {
        id: 5,
        path: '/features/operatorinspection',
        name: 'Operator Inspection',
        type: 'menu',
        icon: 'mdi-checkbox-marked-outline',
      },
      {
        id: 6,
        path: '/features/leadercheck',
        name: 'Leader Confirmation',
        type: 'menu',
        icon: 'mdi-check-all',
      },
      {
        id: 7,
        path: '/features/spvcheck',
        name: 'SPV Confirmation',
        type: 'menu',
        icon: 'mdi-check-all',
      },
    ],
    page: {
      id: '',
      path: '',
      name: '',
      type: '',
      icon: '',
      desc: '',
    },

    inspectionRefresh: ref(0),
  }),
  actions: {
    ajax(data, url, methode, isFile = false) {
      const store = useAppStore(); // satu instance yang konsisten
      store.preload = true; // togglePreload juga bisa

      return new Promise((resolve, reject) => {
        $.ajax({
          type: methode,
          url: `${store.apiServer}${url}`,
          data: data,
          dataType: isFile ? undefined : 'JSON',
          processData: !(data instanceof FormData),
          contentType: !(data instanceof FormData)
            ? 'application/x-www-form-urlencoded; charset=UTF-8'
            : false,
          success: function (response) {
            resolve(response);
          },
          error: (error) => {
            reject(error.responseJSON);
          },
        });
      });
    },
    login(data) {
      this.userData = data;
      this.loged = true;
      router.push(data.homePage);
    },
    logOut() {
      this.userData = {};
      this.loged = false;
      this.preload = true;
      setTimeout(() => {
        router.push('/');
      }, 1000);
    },
    goto(path) {
      router.push(path);
    },

    checkLogic(logicType, standar, input, isLabel) {
      if (input === undefined || input === null) return false;
      let inputVal = typeof input === 'string' ? input.trim() : input;

      const logicT = parseInt(logicType);
      switch (logicT) {
        case 1: // OK/NG Option
          if (!isLabel) {
            return inputVal === 'OK';
          } else {
            return standar[0];
          }

        case 2: // Number Range [min, max]
          const min2 = parseFloat(standar[0]);
          const max2 = parseFloat(standar[1]);
          if (!isLabel) {
            return input >= min2 && input <= max2;
          } else {
            return `${min2} ~ ${max2}`;
          }

        case 3: // Larger Than (>)
          const min3 = parseFloat(standar[0]);
          if (!isLabel) {
            return input > min3;
          } else {
            return `> ${min3}`;
          }

        case 4: // Less Than (<)
          const max4 = parseFloat(standar[0]);

          if (!isLabel) {
            return input < max4;
          } else {
            return `< ${max4}`;
          }

        case 5: // Upper and Lower Limit [target, +x, -x]
          const round = (v, d = 3) =>
            Math.round(v * Math.pow(10, d)) / Math.pow(10, d);

          const target = round(parseFloat(standar[0]));
          const plus = round(parseFloat(standar[1]));
          const minus = round(parseFloat(standar[2]));
          inputVal = round(parseFloat(input));

          if (!isLabel) {
            return (
              inputVal >= round(target - minus) &&
              inputVal <= round(target + plus)
            );
          } else {
            return `${target}, +${plus}, -${minus}`;
          }
        case 6: // ≥ target
          const min6 = parseFloat(standar[0]);
          if (!isLabel) {
            return input >= min6;
          } else {
            return `≥ ${min6}`;
          }

        case 7: // ≤ target
          const max7 = parseFloat(standar[0]);
          if (!isLabel) {
            return input <= max7;
          } else {
            return `≤ ${max7}`;
          }

        case 8: // Match Text (case-insensitive)
          const expectedText = standar[0]?.toString().toLowerCase();
          if (!isLabel) {
            return inputVal?.toString().toLowerCase() === expectedText;
          } else {
            return `${standar[0]}`;
          }

        case 9: // Match Number (exact)
          const expectedNumber = parseFloat(standar[0]);
          if (!isLabel) {
            return parseFloat(input) === expectedNumber;
          } else {
            return `${standar[0]}`;
          }
        case 10: // Not equal
          const number = parseFloat(standar[0]);
          if (!isLabel) {
            return parseFloat(input) != number;
          } else {
            return `≠ ${standar[0]}`;
          }
        case 16: // custom OK/NG
          if (!isLabel) {
            return inputVal === 'OK';
          } else {
            return `${standar[0]}`;
          }
        case 17: // custom OK/NG
          inputVal = parseFloat(input);
          let t = parseFloat(standar[0]);
          const tol = parseFloat(standar[1]);
          const u = t + tol;
          const l = t - tol;
          if (!isLabel) {
            return input <= u && input >= l;
          } else {
            return `${t} ± ${tol}`;
          }

        default:
          return false;
      }
    },

    dataUrlToFile(dataUrl, fileName) {
      let arr = dataUrl.split(','), // Pisahkan header dan data
        mime = arr[0].match(/:(.*?);/)[1], // Ambil MIME type
        bstr = atob(arr[1]), // Decode base64
        n = bstr.length,
        u8arr = new Uint8Array(n);

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      return new File([u8arr], fileName, { type: mime });
    },

    fileToDataURL(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result); // Hasil dalam bentuk Data URL
        reader.onerror = (error) => reject(error);
      });
    },
  },
});

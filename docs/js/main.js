function downloadBlob(blob, filename) {
  // Create an object URL for the blob object
  const url = window.URL.createObjectURL(blob);

  // Create a new anchor element
  const a = document.createElement("a");

  // Set the href and download attributes for the anchor element
  // You can optionally set other attributes like `title`, etc
  // Especially, if the anchor element will be attached to the DOM
  a.href = url;
  a.download = filename || "download";

  // Click handler that releases the object URL after the element has been clicked
  // This is required for one-off downloads of the blob content
  const clickHandler = () => {
    // window.showSaveFilePicker();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      removeEventListener("click", clickHandler);
    }, 150);
  };

  // Add the click event listener on the anchor element
  // Comment out this line if you don't want a one-off download of the blob content
  a.addEventListener("click", clickHandler, false);

  // Programmatically trigger a click on the anchor element
  // Useful if you want the download to happen automatically
  // Without attaching the anchor element to the DOM
  // Comment out this line if you don't want an automatic download of the blob content
  //a.click();
  // Return the anchor element
  // Useful if you want a reference to the element
  // in order to attach it to the DOM or use it in some other way
  return a.click();
}

const stringifyOptions = (
  options,
  fields = [
    "maxWidth",
    "maxHeight",
    "minWidth",
    "minHeight",
    "width",
    "height",
    "resize",
    "quality",
    "convertTypes",
    "convertSize",
  ]
) => {
  return fields.reduce((acc, field, index) => {
    if (options[field]) {
      if (index === fields.length - 1) {
        return (acc += `${field}-${options[field]}`);
      }
      acc += `${field}-${options[field]},`;
    }
    return acc;
  }, "");
};

window.addEventListener("DOMContentLoaded", function () {
  var Vue = window.Vue;
  var URL = window.URL || window.webkitURL;
  var XMLHttpRequest = window.XMLHttpRequest;
  var Compressor = window.Compressor;

  Vue.component("VueCompareImage", window.vueCompareImage);

  new Vue({
    el: "#app",

    data: function () {
      var vm = this;

      return {
        options: {
          strict: true,
          checkOrientation: true,
          retainExif: false,
          maxWidth: undefined,
          maxHeight: undefined,
          minWidth: 0,
          minHeight: 0,
          width: undefined,
          height: undefined,
          resize: "none",
          quality: 0.8,
          mimeType: "",
          convertTypes: "image/png",
          convertSize: 5000000,
          success: function (result) {
            console.log("Output: ", result);
            console.log("Output size: ", this.options);

            const splitName = result.name.split(".");
            const name =
              splitName[0] +
              "-compressed" +
              stringifyOptions(this.options) +
              "." +
              splitName[1];

            downloadBlob(result, name);

            if (URL) {
              vm.outputURL = URL.createObjectURL(result);
            }

            vm.output = result;
            vm.$refs.input.value = "";
          },
          error: function (err) {
            window.alert(err.message);
          },
        },
        inputURL: "",
        outputURL: "",
        input: {},
        output: {},
      };
    },

    filters: {
      prettySize: function (size) {
        var kilobyte = 1024;
        var megabyte = kilobyte * kilobyte;

        if (size > megabyte) {
          return (size / megabyte).toFixed(2) + " MB";
        } else if (size > kilobyte) {
          return (size / kilobyte).toFixed(2) + " KB";
        } else if (size >= 0) {
          return size + " B";
        }

        return "N/A";
      },
    },

    methods: {
      compress: function (file) {
        if (!file) {
          return;
        }

        console.log("Input: ", file);

        if (URL) {
          this.inputURL = URL.createObjectURL(file);
        }

        this.input = [...this.input, file];
        new Compressor(file, this.options);
      },

      change: function (e) {
        this.input = [];
        if (!e.target.files.length) {
          return;
        }
        [...e.target.files].forEach(this.compress);
      },

      dragover: function (e) {
        e.preventDefault();
      },

      drop: function (e) {
        e.preventDefault();
        this.compress(e.dataTransfer.files ? e.dataTransfer.files[0] : null);
      },
    },

    watch: {
      options: {
        deep: true,
        handler: function () {
          this.input.forEach(this.compress);
        },
      },
    },

    mounted: function () {
      // if (!XMLHttpRequest) {
      //   return;
      // }
      // var vm = this;
      // var xhr = new XMLHttpRequest();
      // xhr.onload = function () {
      //   var blob = xhr.response;
      //   var date = new Date();
      //   blob.lastModified = date.getTime();
      //   blob.lastModifiedDate = date;
      //   blob.name = "picture.jpg";
      //   vm.compress(blob);
      // };
      // xhr.open("GET", "images/picture.jpg");
      // xhr.responseType = "blob";
      // xhr.send();
    },
  });
});

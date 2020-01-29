<template>
  <div id="app">
    <el-card class="box-card" shadow="hover">
      <div slot="header" class="clearfix">
        <span>模式</span>
        <el-input-number
          style="width:80px"
          class="header-item"
          controls-position="right"
          size="mini"
          :min="1"
          :max="20"
          v-model="num"
        ></el-input-number>
        <el-checkbox class="header-item" v-model="detailed">详细</el-checkbox>
      </div>
      <div>
        <div id="row" v-for="(row, i) in pattern" :key="i">
          <el-popover
            v-for="(r, j) in row"
            :key="j"
            class="btn"
            v-model="r.visible"
          >
            <el-form :model="r" label-width="40px" size="mini">
              <el-form-item label="名称">
                <el-input class="input-name" v-model="r.name"> </el-input>
              </el-form-item>
              <el-form-item label="类型">
                <el-select
                  v-model="r.type"
                  @change="r.range = rangeOptions[r.type][0]"
                >
                  <el-option
                    v-for="o in typeOptions"
                    :key="o"
                    :label="o"
                    :value="o"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="范围">
                <el-select
                  v-model="r.range"
                  default-first-option
                  filterable
                  allow-create
                >
                  <el-option
                    v-for="o in rangeOptions[r.type]"
                    :key="o"
                    :label="o"
                    :value="o"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="行数">
                <el-select
                  v-model="r.row"
                  default-first-option
                  filterable
                  allow-create
                >
                  <el-option
                    v-for="o in varOptions(r)"
                    :key="o"
                    :label="o"
                    :value="o"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="列数">
                <el-select
                  v-model="r.col"
                  default-first-option
                  filterable
                  allow-create
                >
                  <el-option
                    v-for="o in varOptions(r)"
                    :key="o"
                    :label="o"
                    :value="o"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-form>
            <div style="text-align: right; margin: 0">
              <el-button type="text" size="mini" @click="removeVar(i, j)"
                >删除</el-button
              >
              <el-button type="primary" size="mini" @click="r.visible = false"
                >确定</el-button
              >
            </div>
            <el-button
              id="add-tag"
              class="button-new-tag"
              size="small"
              slot="reference"
              >{{ showVar(r) }}</el-button
            >
          </el-popover>
          <el-button class="btn" size="small" @click="addVar(i)">+</el-button>
          <el-button
            class="btn"
            size="small"
            type="danger"
            plain
            circle
            icon="el-icon-delete"
            @click="removeRow(i)"
          ></el-button>
        </div>
        <el-button
          id="add-row"
          size="small"
          type="primary"
          plain
          @click="addRow"
          >增加行</el-button
        >
      </div>
    </el-card>
    <el-card class="box-card" shadow="hover">
      <div slot="header" class="clearfix">
        <span>结果</span>
        <el-button
          class="header-item"
          size="small"
          icon="el-icon-refresh-right"
          type="success"
          circle
          plain
          @click="refresh = !refresh"
        ></el-button>
      </div>
      <code>
        <div v-for="(r, i) in result" :key="i">
          <span v-if="i > 0">-</span>
          <div v-for="(v, j) in r" :key="j">{{ v }}</div>
        </div>
      </code>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "app",
  data: function() {
    return {
      mexp: undefined,
      randstring: undefined,
      detailed: true,
      refresh: true,
      num: 5,
      pattern: [
        [
          {
            name: "n",
            type: "int",
            row: "1",
            col: "1",
            range: "1,20",
            visible: false
          }
        ]
      ],
      typeOptions: ["int", "float", "str"],
      add: {
        name: "+",
        type: "int",
        row: "1",
        col: "1",
        range: "1,20",
        visible: false
      },
      rangeOptions: {
        int: ["-2^31,2^31-1", "0,2^31", "0,65535", "-32768,32767"],
        float: ["-3.4e+38,3.4e+38", "-1.7e-308,1.7e+308"],
        str: ["3,10"]
      }
    };
  },
  computed: {
    result: function() {
      let results = [];
      let values = {};
      let mexp = this.mexp;
      function getValue(v) {
        let _v = values[v];
        if (_v) _v = _v[0][0];
        return _v || mexp.eval(v);
      }
      function decode(range) {
        // n or n,m
        let a = range.split(",");
        if (a.length === 1) {
          return [getValue(range)];
        } else {
          let l = getValue(a[0]);
          let r = getValue(a[1]);
          return [l, r];
        }
      }
      if (this.refresh || !this.refresh) {
        for (let _n = 0; _n < this.num; _n++) {
          values = {};
          let lines = [];
          for (let row of this.pattern) {
            let line = [];
            for (let r of row) {
              let rr = this.rand(decode(r.row));
              let rc = decode(r.col);
              let ra = decode(r.range);
              let v = [];
              for (let i = 0; i < rr; i++) {
                let c = [];
                for (let j = 0; j < this.rand(rc); j++) {
                  c.push(this.rand(ra, r.type));
                }
                v.push(c);
                if (rr === 1) {
                  line = line.concat(c);
                } else {
                  lines.push(c.join(" "));
                }
              }
              values[r.name] = v;
            }
            if (line.length > 0) lines.push(line.join(" "));
          }
          results.push(lines);
        }
      }
      return results;
    }
  },
  created() {
    this.mexp = require("math-expression-evaluator");
    this.randstring = require("randomstring");
  },
  methods: {
    rand(r, type = "int") {
      if (r.length === 1) return r[0];
      let l = r[0];
      r = r[1];
      if (type === "int") return this.randint(l, r);
      else if (type === "float") return this.randfloat(l, r).toFixed(3);
      else if (type === "str") {
        return this.randstr(this.randint(l, r));
      }
    },
    randfloat(min, max) {
      return Math.random() * (max - min) + min;
    },
    randint(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    },
    randstr(length, charset = "alphanumeric") {
      return this.randstring.generate({
        length: length,
        charset: charset,
        readable: true
      });
    },
    removeVar(i, j) {
      this.pattern[i].splice(j, 1);
    },
    removeRow(i) {
      this.pattern.splice(i, 1);
    },
    addRow() {
      this.pattern.push([]);
    },
    showVar(r) {
      if (r.name === "+") return "+";
      let ret = r.name;
      if (this.detailed) {
        ret +=
          "(" +
          r.range +
          ")" +
          ": " +
          r.type +
          "[" +
          r.row +
          "][" +
          r.col +
          "]";
      } else {
        ret += ": " + r.type;
        if (r.row !== "1" && r.col !== "1")
          ret += "[" + r.row + "][" + r.col + "]";
      }
      return ret;
    },
    varOptions(r) {
      let vars = [];
      for (let row of this.pattern) {
        for (let v of row) {
          if (v.name === r.name) break;
          if (v.row === "1" && v.col === "1") vars.push(v.name);
        }
      }
      vars.push("1,100");
      return vars;
    },
    addVar(i) {
      let r = { ...this.add };
      r.name = String.fromCharCode(97 + i) + this.pattern[i].length;
      this.pattern[i].push(r);
    }
  }
};
</script>

<style lang="scss">
#app {
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0 auto;
  max-width: 800px;
}

.header-item {
  margin-left: 20px;
}

.box-card {
  margin-top: 20px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both;
}

.el-tag {
  margin-right: 10px;
}

.btn {
  margin-right: 10px;
}

#row {
  margin-bottom: 10px;
}
</style>

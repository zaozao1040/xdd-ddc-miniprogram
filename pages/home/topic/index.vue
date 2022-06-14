<template>
  <div class="department-management-container">
    <vab-query-form>
      <vab-query-form-right-panel :span="24">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent>
          <el-form-item style="padding-left: 10px">
            <el-input
              v-model.trim="queryForm.name"
              clearable
              placeholder="请输入名称"
            />
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-search" type="primary" @click="queryData">
              查询
            </el-button>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-plus" type="primary" @click="handleEdit()">
              添加
            </el-button>
          </el-form-item>
        </el-form>
      </vab-query-form-right-panel>
    </vab-query-form>
    <el-table
      v-loading="listLoading"
      border
      size="mini"
      :data="list"
      default-expand-all
      row-key="id"
      :tree-props="{ children: 'children' }"
      @selection-change="setSelectRows"
    >
      <el-table-column
        label="标题"
        prop="title"
        width="200"
        show-overflow-tooltip
      />
      <el-table-column label="路由名称" prop="name" show-overflow-tooltip />
      <el-table-column
        label="path"
        prop="path"
        show-overflow-tooltip
        width="250"
      />
      <el-table-column
        label="component"
        prop="component"
        show-overflow-tooltip
        width="250"
      />
      <el-table-column
        label="redirect"
        prop="redirect"
        show-overflow-tooltip
        width="250"
      />
      <el-table-column label="icon" prop="icon" show-overflow-tooltip />
      <el-table-column label="缓存" prop="noKeepAlive" show-overflow-tooltip>
        <template #default="{ row }">
          <el-tag size="mini" :type="row.noKeepAlive ? 'info' : 'success'">
            {{ row.noKeepAlive ? '否' : '是' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="隐藏" prop="hidden" show-overflow-tooltip>
        <template #default="{ row }">
          <el-tag size="mini" :type="row.hidden ? 'success' : 'info'">
            {{ row.hidden ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="始终显示当前节点"
        prop="levelHidden"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <el-tag size="mini" :type="row.levelHidden ? 'success' : 'info'">
            {{ row.levelHidden ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="固定" prop="noClosable" show-overflow-tooltip>
        <template #default="{ row }">
          <el-tag size="mini" :type="row.noClosable ? 'success' : 'info'">
            {{ row.noClosable ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="不显示当前标签页"
        prop="tabHidden"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <el-tag size="mini" :type="row.tabHidden ? 'success' : 'info'">
            {{ row.tabHidden ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="badge" prop="badge" show-overflow-tooltip />
      <el-table-column label="排序" prop="sort" show-overflow-tooltip />

      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button type="text" @click="handleAddSub(row)">
            +添加子菜单
          </el-button>
          <el-button type="text" @click="handleEdit(row)">编辑</el-button>
          <el-button
            v-if="row.children.length == 0"
            type="text"
            @click="handleDelete(row)"
            style="color: #f56c6c"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-image
          class="vab-data-empty"
          :src="require('@/assets/empty_images/data_empty.png')"
        />
      </template>
    </el-table>
    <edit ref="edit" @fetch-data="fetchData" />
  </div>
</template>

<script>
  import { qqRequest } from '@/api/public/public.js'
  import edit from './components/edit'

  export default {
    name: 'cdgl',
    components: { edit },
    data() {
      return {
        list: [],
        listLoading: true,
        layout: 'total, sizes, prev, pager, next, jumper',
        total: 0,
        selectRows: '',
        queryForm: {
          page: 1,
          limit: 20,
          title: '',
        },
      }
    },
    created() {
      this.fetchData()
    },
    methods: {
      setSelectRows(val) {
        this.selectRows = val
      },
      handleEdit(row) {
        if (row && row.id) {
          this.$refs['edit'].showEdit(row)
        } else {
          this.$refs['edit'].showEdit()
        }
      },
      handleAddSub(row) {
        this.$refs['edit'].showEdit(row, 'sub')
      },
      handleDelete(row) {
        if (row.id) {
          this.$baseConfirm('你确定要删除当前项吗', null, async () => {
            const { data, code, message } = await qqRequest({
              url: '/menu/delete',
              method: 'post',
              data: { id: row.id },
            })
            if (code == 200) {
              this.$baseMessage(
                '删除成功',
                'success',
                'vab-hey-message-success'
              )
              this.fetchData()
            } else {
              this.$baseMessage(message, 'error', 'vab-hey-message-error')
            }
          })
        }
      },
      handleSizeChange(val) {
        this.queryForm.limit = val
        this.fetchData()
      },
      handleCurrentChange(val) {
        this.queryForm.page = val
        this.fetchData()
      },
      queryData() {
        this.queryForm.page = 1
        this.fetchData()
      },
      async fetchData() {
        this.listLoading = true
        const { data, code, msg } = await qqRequest({
          url: '/menu/list',
          method: 'get',
          data: this.queryForm,
        })
        if (Array.isArray(data) && data.length > 0) this.list = data[0].children
        // this.total = data.total
        this.listLoading = false
        console.log('@@@@@@@ 2 @@@@@@@ ', this.list)
      },
    },
  }
</script>

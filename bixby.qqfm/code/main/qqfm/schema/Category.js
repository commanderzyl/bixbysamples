/**
 * 电台分类对象定义
 * @param {string} id 分类id
 * @param {string} name 分类名
 * @param {string} level 分类层级，分为"1","2"等，按字符串排序，位置越靠前，层级越高
 * @param {string} parentId 父分类id
 * @see 具体可以参考API文档。http://api.fm.qq.com/
 */
function Category(id, name, level, parentId) {
    // id
    this.id = id;

    // 分类名
    this.name = name;

    // 分类大小
    this.level = level;

    // 子分类列表
    this.subCategoryList = [];

    // 父分类id
    this.parentId = parentId;
}

/**
 * 获取分类id
 * @returns {string} 分类id
 */
Category.prototype.getId = function() {
    return this.id;
};

/**
 * 获取分类名
 * @returns {string} 分类名
 */
Category.prototype.getName = function() {
    return this.name;
};

/**
 * 获取分类层级
 * @returns {string} 分类层级
 */
Category.prototype.getLevel = function() {
    return this.level;
};

/**
 * 获取父分类id
 * @returns {string} 父分类id
 */
Category.prototype.getParentId = function() {
    return this.parentId;
};

/**
 * 添加子分类
 * @param {Category} category 子分类
 */
Category.prototype.addSubCategory = function(category) {
    if (!(category instanceof Category)) {
        throw new Error("category is not instanceof Category");
    }

    this.subCategoryList.push(category);
};

/**
 * 根据子分类id获取某个子分类，由于分类可能层级很深，所以需要递归调用才能获取结果。
 * @param {string} id 子分类id
 * @returns {Category} 如果存在返回子分类, 不存在返回null.
 */
Category.prototype.getSubCategoryById = function(id) {
    if (this.subCategoryList.length == 0) {
        return null;
    }

    for (var index = 0; index < this.subCategoryList.length; index++) {
        var subCategory = this.subCategoryList[index];
        if (subCategory.getId() == id) {
            return subCategory;
        }

        subCategory = subCategory.getSubCategoryById(id);
        if (subCategory != null) {
            return subCategory;
        }
    }
    return null;
};

/**
 * 根据子分类名字获取某个子分类，由于分类可能层级很深，所以需要递归调用才能获取结果。
 * @param {string} name 子分类名字
 * @returns {Category} 如果存在返回子分类, 不存在返回null.
 */
Category.prototype.getSubCategoryByName = function(name) {
    if (this.subCategoryList.length == 0) {
        return null;
    }

    for (var index = 0; index < this.subCategoryList.length; index++) {
        var subCategory = this.subCategoryList[index];
        if (subCategory.getName() === name) {
            return subCategory;
        }

        subCategory = subCategory.getSubCategoryByName(name);
        if (subCategory != null) {
            return subCategory;
        }
    }
    return null;
};

module && (module.exports = Category);
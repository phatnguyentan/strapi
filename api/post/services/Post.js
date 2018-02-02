'use strict';

/**
 * Post.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

// Public dependencies.
const _ = require('lodash');

// Strapi utilities.
const utils = require('strapi-bookshelf/lib/utils/');

module.exports = {

  /**
   * Promise to fetch all posts.
   *
   * @return {Promise}
   */

  fetchAll: (params) => {
    const convertedParams = strapi.utils.models.convertParams('post', params);

    return Post.query(function(qb) {
      _.forEach(convertedParams.where, (where, key) => {
        qb.where(key, where.symbol, where.value);
      });

      if (convertedParams.sort) {
        qb.orderBy(convertedParams.sort);
      }

      qb.offset(convertedParams.start);

      qb.limit(convertedParams.limit);
    }).fetchAll({
      withRelated: _.keys(_.groupBy(_.reject(strapi.models.post.associations, {autoPopulate: false}), 'alias'))
    });
  },

  /**
   * Promise to fetch a/an post.
   *
   * @return {Promise}
   */

  fetch: (params) => {
    return Post.forge(_.pick(params, 'id')).fetch({
      withRelated: _.keys(_.groupBy(_.reject(strapi.models.post.associations, {autoPopulate: false}), 'alias'))
    });
  },

  /**
   * Promise to add a/an post.
   *
   * @return {Promise}
   */

  add: async (values) => {
    const data = await Post.forge(_.omit(values, _.keys(_.groupBy(strapi.models.post.associations, 'alias')))).save();
    await strapi.hook.bookshelf.manageRelations('post', _.merge(_.clone(data.toJSON()), { values }));
    return data;
  },

  /**
   * Promise to edit a/an post.
   *
   * @return {Promise}
   */

  edit: async (params, values) => {
    await strapi.hook.bookshelf.manageRelations('post', _.merge(_.clone(params), { values }));
    return Post.forge(params).save(_.omit(values, _.keys(_.groupBy(strapi.models.post.associations, 'alias'))), {path: true});
  },

  /**
   * Promise to remove a/an post.
   *
   * @return {Promise}
   */

  remove: (params) => {
    _.forEach(Post.associations, async association => {
      await Post.forge(params)[association.alias]().detach();
    });
    return Post.forge(params).destroy();
  }
};

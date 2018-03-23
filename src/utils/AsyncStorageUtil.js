import React,{Component} from 'react';
import{AsyncStorage} from 'react-native';

export default class AsyncStorageUtil {
  /**
   * 保存一个值
   * @param key
   * @param value
   */
  static async saveString(key, value) {
    if (key != null && value != null) {
      //Key 与Value 都不为空
      try {
        await AsyncStorage.setItem(key, value)
      } catch (err) {
        return Promise.reject(err)
      }
      return Promise.resolve(true);
    } else {
      return Promise.reject({"msg": "Key and value can not be null"});
    }
  }

  /**
   * 获取一个值
   * @param key
   * @param defaultValue
   */
  static async getString(key, defaultValue) {
    let result = null;
    let noDataError = {"msg": "No value found !"};
    if (key != null) {
      result = await AsyncStorage.getItem(key);
      return result ? result : defaultValue!=null ? defaultValue : Promise.reject(noDataError);
    } else {
      if (defaultValue) {
        return Promise.resolve(defaultValue);
      } else {
        return Promise.reject(noDataError);
      }
    }

  }

  static async remove(key) {
    let result = true;
    try {
      result = await AsyncStorage.removeItem(key);
    } catch (err) {
      return Promise.reject(err)
    }
    return result;
  }

}
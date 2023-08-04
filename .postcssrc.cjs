module.exports = {
  plugins: {
    autoprefixer: {
      Browserslist: ["Android >= 4.0", "iOS >= 7"],
    },
    "postcss-pxtorem": {
      rootValue: 37.5,
      propList: ["*"],
      minPixelValue: 1,
      // 黑名单
      selectorBlackList: [
        'van-',
        '.ignore'
      ],
    },
  },
};
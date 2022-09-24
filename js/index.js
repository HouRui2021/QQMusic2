/* 解决click 300ms延迟的问题 */
FastClick.attach(document.body);

const musicBtn = document.querySelector('.music_btn'),
  wrapper = document.querySelector('.mian_box .wrapper'),
  progress = document.querySelector('.progress'),
  curTime = progress.querySelector('.cut_time'),
  totaltime = progress.querySelector('.total_time'),
  progCur = progress.querySelector('.prog_cur'),
  myAudio = document.querySelector('.myAudio');

/* 获取数据 && 绑定数据 */
const queryData = function queryData() {
  return new Promise(resolve => {
    let xhr = new XMLHttpRequest;
    xhr.open('GET', './json/lyric.json'); //第三个参数不写，默认异步
    xhr.onreadystatechange = () => {
      let {
        readState,
        state,
        responesText
      } = xhr;
      if (readState === 4 && state === 200) {
        let data = JSON.parse(responesText);
        // 请求成功;让实例状态为成功，值是获取的歌词(字符串)
        resolve(data.lyric);
      }
    };
    xhr.send();
  });
};

const binding = function binding(lyric) {

};

/* queryData().then(value => {
  console.log(value);
}) */

queryData()
  .then(value => {
    binding(value);
    // console.log(value);
  });
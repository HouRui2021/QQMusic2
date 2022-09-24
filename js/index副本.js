/*解决click的300ms延迟问题 */
FastClick.attach(document.body);

const musicBth = document.querySelector('.music_btn'),
  wrapper = document.querySelector('.main_box .wrapper'),
  progress = document.querySelector('.progress'),
  curTime = progress.querySelector('.cur_time'),
  totalTime = progress.querySelector('.total_time'),
  progCur = progress.querySelector('.prog_cur'),
  myAudio = document.querySelector('.myAudio');
let lyricList = [], // 记录歌词的 集合
  //声明变量，上一个歌词是哪个一，除非有了新匹配的才更新
  prevLyric = null, //上一个选中的的歌词
  num = 0, // 记录歌词切换的次数
  // T = 0, // 记录歌词的位置
  PH = 0; // 一行歌词的高度

/*获取数据 && 绑定数据 */
const queryData = function queryData() {
  return new Promise(resolve => {
    let xhr = new XMLHttpRequest;
    xhr.open('GET', './json/Easonchan.json'); //第三个参数不写，默认异步
    xhr.onreadystatechange = () => {
      let {
        readyState,
        status,
        responseText
      } = xhr;
      if (readyState === 4 && status === 200) {
        let data = JSON.parse(responseText);
        resolve(data.lyric);
      }
    }
    xhr.send();
  });
};

const binding = function binding(lyric) {
  // 歌词解析
  let data = [];
  // lyric = lyric.replace(/&#(32|40|41|45);/g, (val, $1) => {
  //   // 映射表 代替switch case判断
  //   let table = {
  //     32: '',
  //     40: '(',
  //     41: ')',
  //     45: '_'
  //   };
  //   return table[$1] || val;
  // });
  lyric.replace(/\[(\d+):(\d+).(?:\d+)\]([^\n]+)(?:\\n)?/g, (_, minutes, seconds, text) => {
    data.push({
      minutes,
      seconds,
      text
    });
  });

  // 歌词绑定
  let str = ``;
  data.forEach(item => {
    let {
      minutes,
      seconds,
      text
    } = item;
    str += `<p minutes="${minutes}" seconds="${seconds}">
        ${text}
    </p>`
  });
  wrapper.innerHTML = str;
  lyricList = Array.from(wrapper.querySelectorAll('p'));
  PH = lyricList[0].offsetHeight;
};

/* queryData().then(value => {
  console.log(value);
}) */

/* 歌词滚动 & 进度条处理 */
const audioPause = function audioPause() {
  myAudio.pause();
  musicBth.classList.remove('move');
  clearInterval(autoTimer);
  autoTimer = null;
};
const format = function format(time) {
  time = +time;
  let obj = {
    minutes: '00',
    seconds: '00'
  };
  if (time) {
    let m = Math.floor(time / 60),
      s = Math.round(time - m * 60);
    obj.minutes = m < 10 ? '0' + m : '' + m; //不足两位补0
    obj.seconds = s < 10 ? '0' + s : '' + s; //不足两位补0
  }
  return obj;
}
const handlelyric = function handlelyric() {
  let {
    duration,
    currentTime
  } = myAudio,
  a = format(currentTime);
  // 控制歌词选中
  for (let i = 0; i < lyricList.length; i++) {
    // item 是每一个歌词对应的P标签
    let item = lyricList[i];
    let minutes = item.getAttribute('minutes'),
      seconds = item.getAttribute('seconds');
    if (minutes === a.minutes && seconds === a.seconds) {
      // 发现一个新匹配的，代替上面
      if (prevLyric) prevLyric.className = '';
      item.className = "active";
      prevLyric = item;
      num++;
      break;
      // return
    }
  }

  // 控制歌词移动
  if (num > 4) {
    // let t = parseFloat(window.getComputedStyle(wrapper).T)
    wrapper.style.top = `${-(num - 3) * PH}px`;
  }
  // 音乐播放结束
  if (currentTime >= duration) {
    wrapper.style.top = '0px';
    if (prevLyric) prevLyric.className = '';
    num = 0;
    prevLyric = null
    audioPause();
  }
};
const handleProgress = function handleProgress() {
  let {
    duration,
    currentTime
  } = myAudio,
  a = format(duration),
    b = format(currentTime);
  if (currentTime >= duration) {
    // 播放结束
    curTime.innerHTML = `00:00`;
    progCur.style.width = `0%`;
    audioPause();
    return;
  }
  curTime.innerHTML = `${b.minutes}:${b.seconds}`;
  totalTime.innerHTML = `${a.minutes}:${a.seconds}`;
  progCur.style.width = `${currentTime/duration * 100}%`;
};

$sub.on('playing', handlelyric);
$sub.on('playing', handleProgress);

/* 控制播放暂停 */
let autoTimer = null;
const handle = function handle() {
  musicBth.style.opacity = 1;
  musicBth.addEventListener('click', function () {
    if (myAudio.paused) {
      // 当前是暂停的：让其播放 && 开启定时器
      myAudio.play();
      musicBth.classList.add('move');

      if (autoTimer === null) {
        $sub.emit('playing');
        autoTimer = setInterval(() => {
          $sub.emit('playing');
        }, 1000);
      }
      return;
    }
    // 当前是播放的：我们让其暂停
    audioPause();
  });
};
/* document.addEventListener('visibilitychange', function () {
  if (document.hidden) {
    //离开页卡
    clearInterval(autoTimer);
    autoTimer = null;
    return;
  }
  // 进入页卡
  if (autoTimer === null) {
    $sub.emit('playing');
    autoTimer = setInterval(() => {
      $sub.emit('playing');
    }, 1000);
  }

}); */

queryData()
  .then(value => {
    binding(value);
    handle();
    // console.log(value);
  });
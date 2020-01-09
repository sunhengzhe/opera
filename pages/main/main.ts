interface IOpera {
  readonly link: string;
  readonly title: string;
  readonly context: wx.VideoContext;
}

interface IPageData {
  operas: Array<IOpera>;
  currentOperaIndex: number;
  recorderManager: wx.RecorderManager;
  isRecording: boolean;
  recordStartTime: Date;
}

interface IPage {
  data: IPageData;
  onSwiperChange(e: any): void;
  onVideoEnded(): void;
  switchToNextVideo(nextIndex: number): void;
  startRecord(): void;
  stopRecord(): void;
  initOperas(): void;
  initRecorders(): void;
}

Page<IPageData, IPage>({
  onShareAppMessage() {
    return {
      title: "听个戏吧",
      path: "pages/main"
    };
  },

  data: {
    currentOperaIndex: 0,
    operas: [],
    recorderManager: wx.getRecorderManager(),
    isRecording: false,
    recordStartTime: new Date()
  },

  onLoad() {
    this.initOperas();
    this.initRecorders();
  },

  initOperas() {
    // fetch a page
    const operas: Array<IOpera> = [];
    for (let i = 0; i < 5; i++) {
      operas.push({
        title: "黄梅戏" + i,
        link:
          "http://wxsnsdy.tc.qq.com/105/20210/snsdyvideodownload?filekey=30280201010421301f0201690402534804102ca905ce620b1241b726bc41dcff44e00204012882540400&bizid=1023&hy=SH&fileparam=302c020101042530230204136ffd93020457e3c4ff02024ef202031e8d7f02030f42400204045a320a0201000400",
        context: wx.createVideoContext(`opera-${i}`)
      });
    }

    this.setData!({ operas: operas }, () => {
      this.data.operas[0].context.play();
    });
  },

  initRecorders() {
    const { recorderManager } = this.data;

    recorderManager.onStop(res => {
      console.log(res);

      wx.uploadFile({
        url: "https://xxxx",
        filePath: res.tempFilePath,
        name: "file",
        header: {
          "content-type": "multipart/form-data"
        },
        success: function(res) {
          console.log(res);
        },
        fail: function() {
          console.log("语音识别失败");
        }
      });
    });
  },

  switchToNextVideo(nextIndex: number) {
    const prevIndex = this.data.currentOperaIndex;
    // 停止上一页的视频
    this.data.operas[prevIndex].context.seek(0);
    this.data.operas[prevIndex].context.pause();

    this.setData!(
      {
        currentOperaIndex: nextIndex
      },
      () => {
        // 开始当前页的视频
        this.data.operas[nextIndex].context.play();
      }
    );
  },

  onSwiperChange(e: any) {
    this.switchToNextVideo(e.detail.current);
  },

  onVideoEnded() {
    this.switchToNextVideo(this.data.currentOperaIndex + 1);
  },

  startRecord() {
    const { recorderManager, isRecording } = this.data;

    if (isRecording) {
      return;
    }

    console.log("record start");

    this.setData!({ isRecording: true, recordStartTime: new Date() });

    const options = {
      duration: 10000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 64000,
      format: "mp3",
      frameSize: 50
    } as wx.RecorderManagerStartOption;

    recorderManager.start(options);
  },

  stopRecord() {
    const { recorderManager, isRecording, recordStartTime } = this.data;

    if (!isRecording) {
      return;
    }

    const duration = new Date().getTime() - recordStartTime.getTime();

    if (duration < 1000) {
      console.log("record too short ");
      return;
    }

    console.log("record end ", duration);

    this.setData!({ isRecording: false });

    recorderManager.stop();
  }
});

interface IOpera {
  readonly link: string;
  readonly title: string;
  readonly context: wx.VideoContext;
}

interface IPageData {
  operas: IOpera[];
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

interface IOperaDTO {
  readonly title: string;
  readonly link: string;
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
    wx.request({
      url: 'http://localhost:3000/operas',
      data: {
        pageIndex: 0,
        pageSize: 5
      },
      success: (res) => {
        const operaList = <IOperaDTO[]>res.data;
        const operas: IOpera[] = operaList.map((dto, i) => ({
          title: dto.title,
          link: dto.link,
          context: wx.createVideoContext(`opera-${i}`)
        }));

        this.setData!({ operas: operas }, () => {
          this.data.operas[0].context.play();
        });
      }
    })
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
    const { currentOperaIndex, operas } = this.data;

    if (currentOperaIndex === operas.length - 1) {
      return;
    }

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
      format: 'PCM',
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

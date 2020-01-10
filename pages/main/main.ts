interface IOpera {
  readonly id: number;
  readonly link: string;
  readonly title: string;
  readonly context: wx.VideoContext;
}

interface IPageData {
  operas: IOpera[];
  currentOperaIndex: number;
}

interface IPage {
  data: IPageData;
  recorderManager: wx.RecorderManager;
  isRecording: boolean;
  recordStartTime: Date;
  currentPageIndex: number;
  onSwiperChange(e: any): void;
  onVideoEnded(): void;
  switchToNextVideo(nextIndex: number): void;
  startRecord(): void;
  stopRecord(): void;
  requestOperas(findOperasDTO: IFindOperasDTO): void;
  initRecorders(): void;
}

interface IOperaDTO {
  readonly id: number;
  readonly title: string;
  readonly link: string;
}

interface IFindOperasDTO {
  pageIndex: number;
  pageSize?: number;
}

const PAGE_SIZE = 5;

Page<IPageData, IPage>({
  onShareAppMessage() {
    return {
      title: "听个戏吧",
      path: "pages/main"
    };
  },

  recorderManager: wx.getRecorderManager(),
  isRecording: false,
  recordStartTime: new Date(),
  currentPageIndex: 0,

  data: {
    currentOperaIndex: 0,
    operas: [],
  },

  onLoad() {
    this.requestOperas({ pageIndex: this.currentPageIndex });
    this.initRecorders();
  },

  requestOperas(findOperasDTO: IFindOperasDTO) {
    // fetch a page
    wx.request({
      url: 'http://10.8.96.196:3000/operas',
      data: {
        pageIndex: findOperasDTO.pageIndex,
        pageSize: PAGE_SIZE
      },
      success: (res) => {
        const newOperas = (<IOperaDTO[]>res.data).map(dto => ({
          id: dto.id,
          title: dto.title,
          link: dto.link,
          context: wx.createVideoContext(`opera-${dto.id}`)
        }));

        const operas: IOpera[] = this.data.operas.concat(newOperas);
        this.setData!({ operas: operas }, () => {
          this.data.operas[0].context.play();
        });
      }
    })
  },

  switchToNextVideo(nextIndex: number) {
    const { currentOperaIndex, operas } = this.data;
    const { currentPageIndex } = this;

    const prevIndex = currentOperaIndex;
    // 停止上一页的视频
    operas[prevIndex].context.seek(0);
    operas[prevIndex].context.pause();

    this.setData!(
      {
        currentOperaIndex: nextIndex
      },
      () => {
        // 开始当前页的视频
        operas[nextIndex].context.play();

        // 请求下一页
        const threshold = operas.length - Math.ceil(PAGE_SIZE / 2);

        if (nextIndex === threshold) {
          const nextPageIndex = currentPageIndex + 1;
          this.currentPageIndex = nextPageIndex;
          this.requestOperas({ pageIndex: nextPageIndex });
        }
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

  initRecorders() {
    const { recorderManager } = this;

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

  startRecord() {
    const { recorderManager, isRecording } = this;

    if (isRecording) {
      return;
    }

    console.log("record start");

    this.isRecording = true;
    this.recordStartTime = new Date();

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
    const { recorderManager, isRecording, recordStartTime } = this;

    if (!isRecording) {
      return;
    }

    const duration = new Date().getTime() - recordStartTime.getTime();

    if (duration < 1000) {
      console.log("record too short ");
      return;
    }

    console.log("record end ", duration);

    this.isRecording = false;

    recorderManager.stop();
  }
});

interface IOpera{
  readonly link: string;
  readonly title: string;
  readonly context: wx.VideoContext;
}

interface IPageData {
  operas: Array<IOpera>;
  currentOperaIndex: number;
}

interface IPage {
  data: IPageData;
  onSwiperChange(e: any): void;
  onVideoEnded(): void;
  switchToNextVideo(nextIndex: number): void;
}

Page<IPageData, IPage>({
  onShareAppMessage() {
    return {
      title: '听个戏吧',
      path: 'pages/main'
    }
  },

  data: {
    currentOperaIndex: 0,
    operas: []
  },

  onLoad() {
    // fetch a page
    const initOperas: Array<IOpera> = [];
    for (let i = 0; i < 5; i++) {
      initOperas.push({
        title: '黄梅戏' + i,
        link: 'http://wxsnsdy.tc.qq.com/105/20210/snsdyvideodownload?filekey=30280201010421301f0201690402534804102ca905ce620b1241b726bc41dcff44e00204012882540400&bizid=1023&hy=SH&fileparam=302c020101042530230204136ffd93020457e3c4ff02024ef202031e8d7f02030f42400204045a320a0201000400',
        context: wx.createVideoContext(`opera-${i}`)
      });
    }

    this.setData!({ operas: initOperas }, () => {
      this.data.operas[0].context.play();
    });
  },

  switchToNextVideo(nextIndex: number) {
    const prevIndex = this.data.currentOperaIndex;
    // 停止上一页的视频
    this.data.operas[prevIndex].context.seek(0);
    this.data.operas[prevIndex].context.pause();

    this.setData!({
      currentOperaIndex: nextIndex
    }, () => {
      // 开始当前页的视频
      this.data.operas[nextIndex].context.play();
    });
  },

  onSwiperChange(e: any) {
    this.switchToNextVideo(e.detail.current);
  },

  onVideoEnded() {
    this.switchToNextVideo(this.data.currentOperaIndex + 1);
  }
})

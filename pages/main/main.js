"use strict";
var PAGE_SIZE = 5;
Page({
    onShareAppMessage: function () {
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
    onLoad: function () {
        this.requestOperas({ pageIndex: this.currentPageIndex });
        this.initRecorders();
    },
    requestOperas: function (findOperasDTO) {
        var _this = this;
        wx.request({
            url: 'http://10.8.96.196:3000/operas',
            data: {
                pageIndex: findOperasDTO.pageIndex,
                pageSize: PAGE_SIZE
            },
            success: function (res) {
                var newOperas = res.data.map(function (dto) { return ({
                    id: dto.id,
                    title: dto.title,
                    link: dto.link,
                    context: wx.createVideoContext("opera-" + dto.id)
                }); });
                var operas = _this.data.operas.concat(newOperas);
                _this.setData({ operas: operas }, function () {
                    _this.data.operas[0].context.play();
                });
            }
        });
    },
    switchToNextVideo: function (nextIndex) {
        var _this = this;
        var _a = this.data, currentOperaIndex = _a.currentOperaIndex, operas = _a.operas;
        var currentPageIndex = this.currentPageIndex;
        var prevIndex = currentOperaIndex;
        operas[prevIndex].context.seek(0);
        operas[prevIndex].context.pause();
        this.setData({
            currentOperaIndex: nextIndex
        }, function () {
            operas[nextIndex].context.play();
            var threshold = operas.length - Math.ceil(PAGE_SIZE / 2);
            if (nextIndex === threshold) {
                var nextPageIndex = currentPageIndex + 1;
                _this.currentPageIndex = nextPageIndex;
                _this.requestOperas({ pageIndex: nextPageIndex });
            }
        });
    },
    onSwiperChange: function (e) {
        this.switchToNextVideo(e.detail.current);
    },
    onVideoEnded: function () {
        var _a = this.data, currentOperaIndex = _a.currentOperaIndex, operas = _a.operas;
        if (currentOperaIndex === operas.length - 1) {
            return;
        }
        this.switchToNextVideo(this.data.currentOperaIndex + 1);
    },
    initRecorders: function () {
        var recorderManager = this.recorderManager;
        recorderManager.onStop(function (res) {
            console.log(res);
            wx.uploadFile({
                url: "https://xxxx",
                filePath: res.tempFilePath,
                name: "file",
                header: {
                    "content-type": "multipart/form-data"
                },
                success: function (res) {
                    console.log(res);
                },
                fail: function () {
                    console.log("语音识别失败");
                }
            });
        });
    },
    startRecord: function () {
        var _a = this, recorderManager = _a.recorderManager, isRecording = _a.isRecording;
        if (isRecording) {
            return;
        }
        console.log("record start");
        this.isRecording = true;
        this.recordStartTime = new Date();
        var options = {
            duration: 10000,
            sampleRate: 16000,
            numberOfChannels: 1,
            encodeBitRate: 64000,
            format: 'PCM',
            frameSize: 50
        };
        recorderManager.start(options);
    },
    stopRecord: function () {
        var _a = this, recorderManager = _a.recorderManager, isRecording = _a.isRecording, recordStartTime = _a.recordStartTime;
        if (!isRecording) {
            return;
        }
        var duration = new Date().getTime() - recordStartTime.getTime();
        if (duration < 1000) {
            console.log("record too short ");
            return;
        }
        console.log("record end ", duration);
        this.isRecording = false;
        recorderManager.stop();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQXNDQSxJQUFNLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFFcEIsSUFBSSxDQUFtQjtJQUNyQixpQkFBaUI7UUFDZixPQUFPO1lBQ0wsS0FBSyxFQUFFLE1BQU07WUFDYixJQUFJLEVBQUUsWUFBWTtTQUNuQixDQUFDO0lBQ0osQ0FBQztJQUVELGVBQWUsRUFBRSxFQUFFLENBQUMsa0JBQWtCLEVBQUU7SUFDeEMsV0FBVyxFQUFFLEtBQUs7SUFDbEIsZUFBZSxFQUFFLElBQUksSUFBSSxFQUFFO0lBQzNCLGdCQUFnQixFQUFFLENBQUM7SUFFbkIsSUFBSSxFQUFFO1FBQ0osaUJBQWlCLEVBQUUsQ0FBQztRQUNwQixNQUFNLEVBQUUsRUFBRTtLQUNYO0lBRUQsTUFBTTtRQUNKLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUVELGFBQWEsWUFBQyxhQUE2QjtRQUEzQyxpQkFzQkM7UUFwQkMsRUFBRSxDQUFDLE9BQU8sQ0FBQztZQUNULEdBQUcsRUFBRSxnQ0FBZ0M7WUFDckMsSUFBSSxFQUFFO2dCQUNKLFNBQVMsRUFBRSxhQUFhLENBQUMsU0FBUztnQkFDbEMsUUFBUSxFQUFFLFNBQVM7YUFDcEI7WUFDRCxPQUFPLEVBQUUsVUFBQyxHQUFHO2dCQUNYLElBQU0sU0FBUyxHQUFpQixHQUFHLENBQUMsSUFBSyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEdBQUcsSUFBSSxPQUFBLENBQUM7b0JBQ3BELEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRTtvQkFDVixLQUFLLEVBQUUsR0FBRyxDQUFDLEtBQUs7b0JBQ2hCLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSTtvQkFDZCxPQUFPLEVBQUUsRUFBRSxD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b0NBQWUsRUFBRSw0QkFBb0IsQ0FBQztRQUU5QyxJQUFJLFdBQVcsRUFBRTtZQUNmLE9BQU87U0FDUjtRQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7UUFFNUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7UUFDeEIsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBRWxDLElBQU0sT0FBTyxHQUFHO1lBQ2QsUUFBUSxFQUFFLEtBQUs7WUFDZixVQUFVLEVBQUUsS0FBSztZQUNqQixnQkFBZ0IsRUFBRSxDQUFDO1lBQ25CLGFBQWEsRUFBRSxLQUFLO1lBQ3BCLE1BQU0sRUFBRSxLQUFLO1lBQ2IsU0FBUyxFQUFFLEVBQUU7U0FDbUIsQ0FBQztRQUVuQyxlQUFlLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFFRCxVQUFVO1FBQ0YsSUFBQSxTQUF3RCxFQUF0RCxvQ0FBZSxFQUFFLDRCQUFXLEVBQUUsb0NBQXdCLENBQUM7UUFFL0QsSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNoQixPQUFPO1NBQ1I7UUFFRCxJQUFNLFFBQVEsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLGVBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUVsRSxJQUFJLFFBQVEsR0FBRyxJQUFJLEVBQUU7WUFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1lBQ2pDLE9BQU87U0FDUjtRQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBRXJDLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1FBRXpCLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN6QixDQUFDO0NBQ0YsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW50ZXJmYWNlIElPcGVyYSB7XG4gIHJlYWRvbmx5IGlkOiBudW1iZXI7XG4gIHJlYWRvbmx5IGxpbms6IHN0cmluZztcbiAgcmVhZG9ubHkgdGl0bGU6IHN0cmluZztcbiAgcmVhZG9ubHkgY29udGV4dDogd3guVmlkZW9Db250ZXh0O1xufVxuXG5pbnRlcmZhY2UgSVBhZ2VEYXRhIHtcbiAgb3BlcmFzOiBJT3BlcmFbXTtcbiAgY3VycmVudE9wZXJhSW5kZXg6IG51bWJlcjtcbn1cblxuaW50ZXJmYWNlIElQYWdlIHtcbiAgZGF0YTogSVBhZ2VEYXRhO1xuICByZWNvcmRlck1hbmFnZXI6IHd4LlJlY29yZGVyTWFuYWdlcjtcbiAgaXNSZWNvcmRpbmc6IGJvb2xlYW47XG4gIHJlY29yZFN0YXJ0VGltZTogRGF0ZTtcbiAgY3VycmVudFBhZ2VJbmRleDogbnVtYmVyO1xuICBvblN3aXBlckNoYW5nZShlOiBhbnkpOiB2b2lkO1xuICBvblZpZGVvRW5kZWQoKTogdm9pZDtcbiAgc3dpdGNoVG9OZXh0VmlkZW8obmV4dEluZGV4OiBudW1iZXIpOiB2b2lkO1xuICBzdGFydFJlY29yZCgpOiB2b2lkO1xuICBzdG9wUmVjb3JkKCk6IHZvaWQ7XG4gIHJlcXVlc3RPcGVyYXMoZmluZE9wZXJhc0RUTzogSUZpbmRPcGVyYXNEVE8pOiB2b2lkO1xuICBpbml0UmVjb3JkZXJzKCk6IHZvaWQ7XG59XG5cbmludGVyZmFjZSBJT3BlcmFEVE8ge1xuICByZWFkb25seSBpZDogbnVtYmVyO1xuICByZWFkb25seSB0aXRsZTogc3RyaW5nO1xuICByZWFkb25seSBsaW5rOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBJRmluZE9wZXJhc0RUTyB7XG4gIHBhZ2VJbmRleDogbnVtYmVyO1xuICBwYWdlU2l6ZT86IG51bWJlcjtcbn1cblxuY29uc3QgUEFHRV9TSVpFID0gNTtcblxuUGFnZTxJUGFnZURhdGEsIElQYWdlPih7XG4gIG9uU2hhcmVBcHBNZXNzYWdlKCkge1xuICAgIHJldHVybiB7XG4gICAgICB0aXRsZTogXCLlkKzkuKrmiI/lkKdcIixcbiAgICAgIHBhdGg6IFwicGFnZXMvbWFpblwiXG4gICAgfTtcbiAgfSxcblxuICByZWNvcmRlck1hbmFnZXI6IHd4LmdldFJlY29yZGVyTWFuYWdlcigpLFxuICBpc1JlY29yZGluZzogZmFsc2UsXG4gIHJlY29yZFN0YXJ0VGltZTogbmV3IERhdGUoKSxcbiAgY3VycmVudFBhZ2VJbmRleDogMCxcblxuICBkYXRhOiB7XG4gICAgY3VycmVudE9wZXJhSW5kZXg6IDAsXG4gICAgb3BlcmFzOiBbXSxcbiAgfSxcblxuICBvbkxvYWQoKSB7XG4gICAgdGhpcy5yZXF1ZXN0T3BlcmFzKHsgcGFnZUluZGV4OiB0aGlzLmN1cnJlbnRQYWdlSW5kZXggfSk7XG4gICAgdGhpcy5pbml0UmVjb3JkZXJzKCk7XG4gIH0sXG5cbiAgcmVxdWVzdE9wZXJhcyhmaW5kT3BlcmFzRFRPOiBJRmluZE9wZXJhc0RUTykge1xuICAgIC8vIGZldGNoIGEgcGFnZVxuICAgIHd4LnJlcXVlc3Qoe1xuICAgICAgdXJsOiAnaHR0cDovLzEwLjguOTYuMTk2OjMwMDAvb3BlcmFzJyxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgcGFnZUluZGV4OiBmaW5kT3BlcmFzRFRPLnBhZ2VJbmRleCxcbiAgICAgICAgcGFnZVNpemU6IFBBR0VfU0laRVxuICAgICAgfSxcbiAgICAgIHN1Y2Nlc3M6IChyZXMpID0+IHtcbiAgICAgICAgY29uc3QgbmV3T3BlcmFzID0gKDxJT3BlcmFEVE9bXT5yZXMuZGF0YSkubWFwKGR0byA9PiAoe1xuICAgICAgICAgIGlkOiBkdG8uaWQsXG4gICAgICAgICAgdGl0bGU6IGR0by50aXRsZSxcbiAgICAgICAgICBsaW5rOiBkdG8ubGluayxcbiAgICAgICAgICBjb250ZXh0OiB3eC5jcmVhdGVWaWRlb0NvbnRleHQoYG9wZXJhLSR7ZHRvLmlkfWApXG4gICAgICAgIH0pKTtcblxuICAgICAgICBjb25zdCBvcGVyYXM6IElPcGVyYVtdID0gdGhpcy5kYXRhLm9wZXJhcy5jb25jYXQobmV3T3BlcmFzKTtcbiAgICAgICAgdGhpcy5zZXREYXRhISh7IG9wZXJhczogb3BlcmFzIH0sICgpID0+IHtcbiAgICAgICAgICB0aGlzLmRhdGEub3BlcmFzWzBdLmNvbnRleHQucGxheSgpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KVxuICB9LFxuXG4gIHN3aXRjaFRvTmV4dFZpZGVvKG5leHRJbmRleDogbnVtYmVyKSB7XG4gICAgY29uc3QgeyBjdXJyZW50T3BlcmFJbmRleCwgb3BlcmFzIH0gPSB0aGlzLmRhdGE7XG4gICAgY29uc3QgeyBjdXJyZW50UGFnZUluZGV4IH0gPSB0aGlzO1xuXG4gICAgY29uc3QgcHJldkluZGV4ID0gY3VycmVudE9wZXJhSW5kZXg7XG4gICAgLy8g5YGc5q2i5LiK5LiA6aG155qE6KeG6aKRXG4gICAgb3BlcmFzW3ByZXZJbmRleF0uY29udGV4dC5zZWVrKDApO1xuICAgIG9wZXJhc1twcmV2SW5kZXhdLmNvbnRleHQucGF1c2UoKTtcblxuICAgIHRoaXMuc2V0RGF0YSEoXG4gICAgICB7XG4gICAgICAgIGN1cnJlbnRPcGVyYUluZGV4OiBuZXh0SW5kZXhcbiAgICAgIH0sXG4gICAgICAoKSA9PiB7XG4gICAgICAgIC8vIOW8gOWni+W9k+WJjemhteeahOinhumikVxuICAgICAgICBvcGVyYXNbbmV4dEluZGV4XS5jb250ZXh0LnBsYXkoKTtcblxuICAgICAgICAvLyDor7fmsYLkuIvkuIDpobVcbiAgICAgICAgY29uc3QgdGhyZXNob2xkID0gb3BlcmFzLmxlbmd0aCAtIE1hdGguY2VpbChQQUdFX1NJWkUgLyAyKTtcblxuICAgICAgICBpZiAobmV4dEluZGV4ID09PSB0aHJlc2hvbGQpIHtcbiAgICAgICAgICBjb25zdCBuZXh0UGFnZUluZGV4ID0gY3VycmVudFBhZ2VJbmRleCArIDE7XG4gICAgICAgICAgdGhpcy5jdXJyZW50UGFnZUluZGV4ID0gbmV4dFBhZ2VJbmRleDtcbiAgICAgICAgICB0aGlzLnJlcXVlc3RPcGVyYXMoeyBwYWdlSW5kZXg6IG5leHRQYWdlSW5kZXggfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApO1xuICB9LFxuXG4gIG9uU3dpcGVyQ2hhbmdlKGU6IGFueSkge1xuICAgIHRoaXMuc3dpdGNoVG9OZXh0VmlkZW8oZS5kZXRhaWwuY3VycmVudCk7XG4gIH0sXG5cbiAgb25WaWRlb0VuZGVkKCkge1xuICAgIGNvbnN0IHsgY3VycmVudE9wZXJhSW5kZXgsIG9wZXJhcyB9ID0gdGhpcy5kYXRhO1xuXG4gICAgaWYgKGN1cnJlbnRPcGVyYUluZGV4ID09PSBvcGVyYXMubGVuZ3RoIC0gMSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuc3dpdGNoVG9OZXh0VmlkZW8odGhpcy5kYXRhLmN1cnJlbnRPcGVyYUluZGV4ICsgMSk7XG4gIH0sXG5cbiAgaW5pdFJlY29yZGVycygpIHtcbiAgICBjb25zdCB7IHJlY29yZGVyTWFuYWdlciB9ID0gdGhpcztcblxuICAgIHJlY29yZGVyTWFuYWdlci5vblN0b3AocmVzID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKHJlcyk7XG5cbiAgICAgIHd4LnVwbG9hZEZpbGUoe1xuICAgICAgICB1cmw6IFwiaHR0cHM6Ly94eHh4XCIsXG4gICAgICAgIGZpbGVQYXRoOiByZXMudGVtcEZpbGVQYXRoLFxuICAgICAgICBuYW1lOiBcImZpbGVcIixcbiAgICAgICAgaGVhZGVyOiB7XG4gICAgICAgICAgXCJjb250ZW50LXR5cGVcIjogXCJtdWx0aXBhcnQvZm9ybS1kYXRhXCJcbiAgICAgICAgfSxcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgY29uc29sZS5sb2cocmVzKTtcbiAgICAgICAgfSxcbiAgICAgICAgZmFpbDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCLor63pn7Por4bliKvlpLHotKVcIik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9LFxuXG4gIHN0YXJ0UmVjb3JkKCkge1xuICAgIGNvbnN0IHsgcmVjb3JkZXJNYW5hZ2VyLCBpc1JlY29yZGluZyB9ID0gdGhpcztcblxuICAgIGlmIChpc1JlY29yZGluZykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnNvbGUubG9nKFwicmVjb3JkIHN0YXJ0XCIpO1xuXG4gICAgdGhpcy5pc1JlY29yZGluZyA9IHRydWU7XG4gICAgdGhpcy5yZWNvcmRTdGFydFRpbWUgPSBuZXcgRGF0ZSgpO1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIGR1cmF0aW9uOiAxMDAwMCxcbiAgICAgIHNhbXBsZVJhdGU6IDE2MDAwLFxuICAgICAgbnVtYmVyT2ZDaGFubmVsczogMSxcbiAgICAgIGVuY29kZUJpdFJhdGU6IDY0MDAwLFxuICAgICAgZm9ybWF0OiAnUENNJyxcbiAgICAgIGZyYW1lU2l6ZTogNTBcbiAgICB9IGFzIHd4LlJlY29yZGVyTWFuYWdlclN0YXJ0T3B0aW9uO1xuXG4gICAgcmVjb3JkZXJNYW5hZ2VyLnN0YXJ0KG9wdGlvbnMpO1xuICB9LFxuXG4gIHN0b3BSZWNvcmQoKSB7XG4gICAgY29uc3QgeyByZWNvcmRlck1hbmFnZXIsIGlzUmVjb3JkaW5nLCByZWNvcmRTdGFydFRpbWUgfSA9IHRoaXM7XG5cbiAgICBpZiAoIWlzUmVjb3JkaW5nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZHVyYXRpb24gPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHJlY29yZFN0YXJ0VGltZS5nZXRUaW1lKCk7XG5cbiAgICBpZiAoZHVyYXRpb24gPCAxMDAwKSB7XG4gICAgICBjb25zb2xlLmxvZyhcInJlY29yZCB0b28gc2hvcnQgXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnNvbGUubG9nKFwicmVjb3JkIGVuZCBcIiwgZHVyYXRpb24pO1xuXG4gICAgdGhpcy5pc1JlY29yZGluZyA9IGZhbHNlO1xuXG4gICAgcmVjb3JkZXJNYW5hZ2VyLnN0b3AoKTtcbiAgfVxufSk7XG4iXX0=
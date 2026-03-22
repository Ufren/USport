Page({
  data: {
    activities: [
      {
        id: 1,
        title: "周末篮球赛",
        time: "2024-01-20 14:00",
        cover: "/assets/images/activity1.png",
      },
      {
        id: 2,
        title: "游泳公开课",
        time: "2024-01-21 10:00",
        cover: "/assets/images/activity2.png",
      },
    ],
    venues: [
      {
        id: 1,
        name: "篮球馆 A",
        address: "朝阳区建国路 88 号",
        image: "/assets/images/venue1.png",
      },
      {
        id: 2,
        name: "游泳馆 B",
        address: "海淀区中关村大街 100 号",
        image: "/assets/images/venue2.png",
      },
      {
        id: 3,
        name: "足球场 C",
        address: "海淀区五道口",
        image: "/assets/images/venue3.png",
      },
      {
        id: 4,
        name: "羽毛球馆 D",
        address: "朝阳区望京",
        image: "/assets/images/venue4.png",
      },
    ],
  },

  onLoad() {
    this.loadData();
  },

  loadData() {
    return undefined;
  },

  onPullDownRefresh() {
    this.loadData();
    wx.stopPullDownRefresh();
  },
});

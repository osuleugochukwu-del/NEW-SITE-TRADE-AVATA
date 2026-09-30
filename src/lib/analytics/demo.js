export const demoAccount = {
  id: 'demo-mt5',
  name: 'Primary Trading Account',
  owner: 'Demo Workspace',
  platform: 'MetaTrader 5',
  broker: 'Example Broker',
  environment: 'DEMO',
  verification: 'source-demo',
  currency: 'USD',
  login: '•••• 4821',
  leverage: '1:100',
  balance: 10000,
  equity: 12846.20,
  netPnl: 2846.20,
  returnPct: 28.46,
  drawdownPct: 8.7,
  drawdownValue: 1184.30,
  trades: 321,
  wins: 206,
  losses: 115,
  profitFactor: 1.84,
  avgTrade: 24.80,
  avgR: 0.42,
  lastSync: 'Demo data • not connected'
};

export const accounts = [
  demoAccount,
  { id:'account-2', name:'Secondary Account', owner:'Demo Workspace', platform:'cTrader', broker:'Example Broker', environment:'UNCONFIRMED', verification:'unconfirmed', currency:'USD', login:'•••• 0917', leverage:'1:50', balance:5000, equity:5238, netPnl:238, returnPct:4.76, drawdownPct:3.2, drawdownValue:168, trades:74, wins:47, losses:27, profitFactor:1.36, avgTrade:3.22, avgR:0.18, lastSync:'Not connected' }
];

export const trades = [
  ['2026-09-28','EURUSD','BUY',0.40,'1.1682','1.1724',84.20,'Breakout','London','Tue',0.9, -0.2, 46],
  ['2026-09-27','XAUUSD','SELL',0.30,'3742.1','3718.8',214.40,'Pullback','New York','Mon',2.7,-0.4,82],
  ['2026-09-26','NAS100','BUY',0.20,'24104','24018',-86.00,'Trend','New York','Sun',0.3,-1.1,31],
  ['2026-09-25','GBPUSD','BUY',0.50,'1.3412','1.3448',180.00,'Breakout','London','Fri',1.9,-0.3,55],
  ['2026-09-24','EURUSD','SELL',0.30,'1.1711','1.1690',63.00,'Pullback','London','Thu',1.2,-0.2,38],
  ['2026-09-23','XAUUSD','BUY',0.20,'3720.4','3701.2',-192.00,'Reversal','Asia','Wed',0.5,-1.8,96],
  ['2026-09-22','USDJPY','BUY',0.40,'147.21','147.68',168.00,'Trend','London','Tue',2.1,-0.4,72],
  ['2026-09-21','EURUSD','BUY',0.50,'1.1652','1.1689',185.00,'Breakout','London','Mon',2.2,-0.3,64],
  ['2026-09-18','GBPUSD','SELL',0.30,'1.3438','1.3411',81.00,'Pullback','New York','Fri',1.1,-0.2,44],
  ['2026-09-17','XAUUSD','SELL',0.20,'3711.2','3696.4',148.00,'Breakout','New York','Thu',1.8,-0.4,71],
  ['2026-09-16','NAS100','SELL',0.20,'23980','23862',236.00,'Trend','New York','Wed',2.8,-0.2,88],
  ['2026-09-15','EURUSD','SELL',0.40,'1.1703','1.1720',-68.00,'Reversal','London','Tue',0.4,-1.0,29],
  ['2026-09-14','USDJPY','BUY',0.30,'146.82','147.11',87.00,'Pullback','Asia','Mon',1.4,-0.3,53],
  ['2026-09-11','XAUUSD','BUY',0.20,'3682.1','3698.4',163.00,'Breakout','London','Fri',2.0,-0.4,77],
  ['2026-09-10','GBPUSD','BUY',0.40,'1.3380','1.3414',136.00,'Trend','London','Thu',1.6,-0.3,69]
];

export const monthly = [
  ['Apr 2026', 420, 8.1, 1.42, 31, 0.28],
  ['May 2026', 610, 11.7, 1.71, 38, 0.36],
  ['Jun 2026', 284, 5.1, 1.38, 29, 0.22],
  ['Jul 2026', 742, 13.8, 1.96, 44, 0.51],
  ['Aug 2026', 512, 9.2, 1.77, 36, 0.43],
  ['Sep 2026', 278, 4.8, 1.54, 32, 0.31]
];

export const symbols = [
  ['EURUSD', 624, 1.92, 61, 0.54],
  ['XAUUSD', 486, 1.76, 72, 0.68],
  ['GBPUSD', 352, 1.63, 58, 0.47],
  ['USDJPY', 241, 1.51, 55, 0.36],
  ['NAS100', 143, 1.29, 49, 0.27]
];

export const strategies = [
  ['Breakout', 1240, 2.14, 72, 84, 0.61],
  ['Pullback', 894, 1.86, 65, 96, 0.44],
  ['Trend', 512, 1.51, 58, 73, 0.32],
  ['Reversal', 200, 1.18, 51, 68, 0.11]
];

export const sessions = [
  ['London', 1280, 1.93, 71, 142],
  ['New York', 924, 1.74, 66, 118],
  ['Asia', 214, 1.29, 55, 61],
  ['Overlap', 428, 1.61, 63, 72]
];

export const weekday = [
  ['Mon', 612, 1.82, 68],
  ['Tue', 704, 1.91, 71],
  ['Wed', 318, 1.44, 61],
  ['Thu', 526, 1.72, 65],
  ['Fri', 224, 1.31, 56]
];

export const equity = [10000,10080,10040,10170,10120,10340,10410,10380,10590,10520,10740,10680,10920,11120,11040,11360,11280,11510,11620,11840,11710,12060,12190,12040,12330,12510,12480,12640,12846];

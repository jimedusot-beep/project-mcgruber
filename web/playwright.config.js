import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
  testDir:'./tests/browser',timeout:45000,expect:{timeout:10000},fullyParallel:false,workers:1,retries:0,
  reporter:[['list'],['html',{open:'never'}]],
  use:{baseURL:process.env.LAB_TEST_URL||'http://127.0.0.1:4173',trace:'retain-on-failure',screenshot:'only-on-failure',video:'off'},
  webServer:process.env.LAB_TEST_URL?undefined:{command:'npx vite preview --host 127.0.0.1 --port 4173 --strictPort',url:'http://127.0.0.1:4173',reuseExistingServer:!process.env.CI},
  projects:[{name:'desktop-chromium',use:{...devices['Desktop Chrome'],launchOptions:{args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']}}},{name:'iphone-webkit',use:{...devices['iPhone 13'],browserName:'webkit'}}]
});

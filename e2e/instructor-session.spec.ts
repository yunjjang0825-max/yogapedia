import{expect,test}from"@playwright/test";test("unauthenticated instructor route recovers through login",async({page})=>{await page.goto("/instructor");await expect(page).toHaveURL(/login/);});

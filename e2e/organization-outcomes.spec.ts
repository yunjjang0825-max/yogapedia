import{expect,test}from"@playwright/test";test("organization dashboard requires login",async({page})=>{await page.goto("/organization");await expect(page).toHaveURL(/login/);});

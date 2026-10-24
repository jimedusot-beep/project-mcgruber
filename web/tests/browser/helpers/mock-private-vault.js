// Deterministic browser-native test double: no external DNS dependency.
export async function installVaultMock(page,userId) {
 await page.addInitScript(({userId}) => {
   const realFetch=window.fetch.bind(window);
   const state={head:null,uploaded:"",uploads:0,commits:0};
   window.__vaultFake=state;
   window.fetch=async (input,options={}) => {
     const url=typeof input==="string"?input:input.url;
     if(!url.startsWith("https://mock-lab.supabase.co/"))return realFetch(input,options);
     const route=new URL(url).pathname;
     let data={},status=200;
     if(route==="/auth/v1/otp")data={sent:true};
     else if(route==="/auth/v1/verify")data={
       access_token:"test-token",refresh_token:"test-refresh",expires_in:3600,
       user:{id:userId,email:"test@example.org"}};
     else if(route==="/auth/v1/user")data={id:userId,email:"test@example.org"};
     else if(route==="/rest/v1/mcgruber_sync_heads")data=state.head?[state.head]:[];
     else if(route.startsWith("/storage/v1/object/mcgruber-private/")){
       state.uploads++;
       state.uploaded=await options.body.text();
       data={Key:route};
     }else if(route==="/rest/v1/rpc/mcgruber_commit_snapshot"){
       state.commits++;
       const args=JSON.parse(options.body);
       if((state.head?.revision||null)!==args.p_expected_revision){
         status=409;data={message:"SYNC_CONFLICT"};
       }else{
         state.head={revision:args.p_new_revision,object_path:args.p_object_path,
           size_bytes:args.p_size_bytes,updated_at:"2026-10-24T19:40:00Z"};
         data=[state.head];
       }
     }else{status=404;data={message:"Unsupported test endpoint"};}
     return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json"}});
   };
 },{userId});
}

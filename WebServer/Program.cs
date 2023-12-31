using Business.Repository;
using Business.Repository.IRepository;
using DataAccess.Data;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.EntityFrameworkCore;
using Syncfusion.Blazor;
using WebServer.Data;
using WebServer.Hubs;
using WebServer.Service;
using Microsoft.AspNetCore.Identity;
using DataAccess;
using WebServer.Service.IService;
using Microsoft.AspNetCore.ResponseCompression;

Syncfusion.Licensing.SyncfusionLicenseProvider.RegisterLicense("Ngo9BigBOggjHTQxAR8/V1NHaF5cXmVCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdgWXZdcHRRRGhYVkR/WUc=");

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();
builder.Services.AddSyncfusionBlazor();
builder.Services.AddServerSideBlazor();

//builder.Services.AddDbContext<AppDbContext>(options =>
//{
//	options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
//});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options => options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

builder.Services.AddIdentity<IdentityUser, IdentityRole>()
    .AddDefaultTokenProviders()
    .AddDefaultUI()
    .AddEntityFrameworkStores<AppDbContext>();

builder.Services.AddScoped(sp => new HttpClient());
builder.Services.AddScoped<IDBInitializer, DBInitializer>();
builder.Services.AddScoped<ICameraRepository, CameraRepository>();
builder.Services.AddScoped<IEventRepository, EventRepository>();
builder.Services.AddScoped<IBoundingBoxRepository, BoundingBoxRepository>();
builder.Services.AddScoped<IEventVideoRepository, EventVideoRepository>();
builder.Services.AddScoped<IFCMInfoRepository, FCMInfoRepository>();
builder.Services.AddHostedService<MqttBackgroundService>();

builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

builder.WebHost.UseUrls("http://*:8102;https://*:8103");

builder.Services.AddCors(o => o.AddPolicy("Development", builder =>
{
	builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
}));

builder.Services.AddResponseCompression(options =>
{
	options.EnableForHttps = true;
	options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(new[] { "application/octet-stream" });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseResponseCompression();

var provider = new FileExtensionContentTypeProvider();
provider.Mappings[".tflite"] = "application/octet-stream";
app.UseStaticFiles(new StaticFileOptions { ContentTypeProvider = provider });
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapBlazorHub();
app.MapHub<RTCHub>("/hub/rtc");
app.MapFallbackToPage("/_Host");

await SeedDatabase();

app.Run();

async ValueTask SeedDatabase()
{
	using (var scope = app.Services.CreateScope())
	{
		var dbInitializer = scope.ServiceProvider.GetRequiredService<IDBInitializer>();
		await dbInitializer.Initialize();
	}
}

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

// A�adir los servicios necesarios
builder.Services.AddControllersWithViews();

var app = builder.Build();


// Redirecci�n a HTTPS y archivos est�ticos
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseStatusCodePagesWithRedirects("/Error/{0}");

// Configuraci�n de rutas
app.UseRouting();

app.UseAuthorization();

// Definir las rutas del controlador
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();

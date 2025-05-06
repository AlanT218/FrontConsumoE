using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

// Añadir los servicios necesarios
builder.Services.AddControllersWithViews();

var app = builder.Build();


// Redirección a HTTPS y archivos estáticos
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseStatusCodePagesWithRedirects("/Error/{0}");

// Configuración de rutas
app.UseRouting();

app.UseAuthorization();

// Definir las rutas del controlador
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();

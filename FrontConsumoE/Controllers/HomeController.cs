using System.Diagnostics;
using FrontConsumoE.Models;
using Microsoft.AspNetCore.Mvc;

namespace FrontConsumoE.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        [Route("Home/Error")]
        public IActionResult Error(string mensaje = "Ocurri� un error inesperado")
        {
            ViewData["ErrorMessage"] = mensaje;
            return View(); // 
        }

        [Route("Error/{statusCode}")]
        public IActionResult HandleError(int statusCode)
        {
            if (statusCode == 404)
            {
                ViewData["ErrorMessage"] = "Lo sentimos, la p�gina que buscas no existe.";
                return View("Error"); // Redirige error
            }

            // Otros errores gen�ricos
            ViewData["ErrorMessage"] = "Ha ocurrido un error inesperado.";
            return View("Error");
        }
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

    }
}

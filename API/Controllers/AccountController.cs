using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using API.DTOs;
using API.services;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [AllowAnonymous]
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManger;
        private readonly SignInManager<AppUser> _signInManger;
        private readonly TokenService _tokenService;
        public AccountController(UserManager<AppUser> userManger, SignInManager<AppUser> signInManger, TokenService tokenService)
        {
            _tokenService = tokenService;
            _signInManger = signInManger;
            _userManger = userManger;

        }

        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            AppUser user = await _userManger.Users.Include(p => p.Photos)
                .FirstOrDefaultAsync(x => x.Email == loginDto.Email);

            if (user == null) return Unauthorized();

            Microsoft.AspNetCore.Identity.SignInResult result = await _signInManger.CheckPasswordSignInAsync(user, loginDto.Password, false);

            if (result.Succeeded)
            {
                return CreateUserObject(user);
            }

            return Unauthorized();
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
        {
            if (await _userManger.Users.AnyAsync(x => x.Email == registerDto.Email))
            {
                System.Console.WriteLine("Here1");
                ModelState.AddModelError("email", "Email taken");
                return ValidationProblem();
            }

            if (await _userManger.Users.AnyAsync(x => x.UserName == registerDto.Username))
            {
                System.Console.WriteLine("Here2");
                ModelState.AddModelError("username", "Username taken");
                return ValidationProblem();
            }

            AppUser user = new()
            {
                DisplayName = registerDto.DisplayName,
                Email = registerDto.Email,
                UserName = registerDto.Username,
            };

            System.Console.WriteLine("Here");

            IdentityResult result = await _userManger.CreateAsync(user, registerDto.Password);

            if (result.Succeeded)
            {
                return CreateUserObject(user);
            }

            ModelState.AddModelError("Problem", "Problem Registering User");
            return ValidationProblem();
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {
            AppUser user = await _userManger.Users.Include(p => p.Photos)
                .FirstOrDefaultAsync(x => x.Email == User.FindFirstValue(ClaimTypes.Email));

            return CreateUserObject(user);
        }
 
        private UserDto CreateUserObject(AppUser user)
        {
            return new UserDto
            {
                DisplayName = user.DisplayName,
                Image = user?.Photos?.FirstOrDefault(x => x.IsMain)?.Url,
                Token = _tokenService.CreateToken(user),
                Username = user.UserName,
            };
        }
    }
}
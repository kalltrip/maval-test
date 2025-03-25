document.addEventListener("DOMContentLoaded", function () {
    const fetchJSON = async (filename) => {
        try {
            const response = await fetch(`json/${filename}`);
            if (!response.ok) throw new Error(`Failed to load ${filename}`);
            return await response.json();
        } catch (error) {
            console.error(`Error loading ${filename}:`, error);
            return [];
        }
    };

    const jsonFiles = [
        "drinks.json", "soup.json", "starters_veg.json", "starters_non_veg.json",
        "chinese_veg.json", "thali_veg.json", "thali_non_veg.json", "handi_veg.json",
        "handi_non_veg.json", "gravy_veg.json", "gravy_non_veg.json", "breads.json", "rice.json"
    ];

    Promise.all(jsonFiles.map(fetchJSON))
        .then(dataArray => {
            console.log("All JSON files loaded successfully");
            const menuIds = ["drinks-menu", "soup-menu", "starters-veg-menu", "starters-nonveg-menu", 
                "chinese-veg-menu", "thali-veg-menu", "thali-nonveg-menu", "handi-veg-menu", 
                "handi-nonveg-menu", "gravy-veg-menu", "gravy-nonveg-menu", "vegetarian-menu", 
                "nonvegetarian-menu", "breads-menu", "rice-menu"];

            dataArray.forEach((data, index) => {
                if (data.length) populateMenu(data, menuIds[index]);
            });
        })
        .catch(error => console.error("Error fetching menu data:", error));
});


function populateMenu(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID '${containerId}' not found.`);
        return;
    }

    const currentHour = new Date().getHours();

    data.forEach(dish => {
        if (!dish.category) return;

        const categoryClass = dish.category.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        const dishElement = document.createElement("div");
        dishElement.classList.add("dish", categoryClass);

        const isAvailable = currentHour >= dish.startTime && currentHour < dish.endTime;
        const stars = generateStars(dish.rating);

        let shortDesc = dish.description.length > 30 ? dish.description.substring(0, 30) + "..." : dish.description;
        let fullDesc = dish.description;

        dishElement.innerHTML = `
            <i class="fa fa-circle" style="font-size:14px; color: ${dish.veg ? 'green' : 'red'};">
                <span class="${dish.veg ? 'vegetarian' : 'non-vegetarian'}">
                    ${dish.veg ? 'VEGETARIAN' : 'NON-VEGETARIAN'}
                </span>
            </i>
            <div class="dish-content">
                <div class="dish-details">
                    <div class="dish-header">
                        <span class="dish-name">${dish.name}</span>
                    </div>
                    <div class="dish-pricing">
                        <span class="dish-price">Rs ${dish.price} </span>
                      
                    </div>
                    <span class="dish-rating">${stars} (${dish.rating})</span>
                    <p class="dish-description" 
                        data-full="${fullDesc}" 
                        data-short="${shortDesc}">
                        ${window.innerWidth < 480 ? shortDesc + ' <span class="read-more" style="color: #31B404; cursor: pointer;">Read More</span>' : fullDesc}
                    </p>
                </div>
                <img alt="${dish.name}" data-src="${dish.image}" class="lazy-img" />
                </div>
                <div class="dish-footer">
                <span class="tag" onclick="filterDishes('${categoryClass}')">${dish.category}</span>
                 </div>
                 `;
                 //  <img alt="${dish.name}" data-src="${dish.image}" loading="lazy"/>
                 
        container.appendChild(dishElement);
    });

    lazyLoadImages();
    handleReadMore();
}

// function lazyLoadImages() {
//     const lazyImages = document.querySelectorAll(".lazy-img");

//     const observer = new IntersectionObserver((entries, observer) => {
//         entries.forEach(entry => {
//             if (entry.isIntersecting) {
//                 const img = entry.target;
//                 img.src = img.dataset.src;
//                 // img.classList.add("fade-in");
//                 observer.unobserve(img);
//             }
//         });
//     });

//     lazyImages.forEach(img => observer.observe(img));
// }

function lazyLoadImages() {
    document.querySelectorAll(".lazy-img").forEach(img => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.src = entry.target.dataset.src;
                    observer.unobserve(entry.target);
                }
            });
        });
        observer.observe(img);
    });
}
document.addEventListener("DOMContentLoaded", function () {
    const vegetarianBtn = document.querySelector("a[href='#vegetarian']");
    const nonVegetarianBtn = document.querySelector("a[href='#non-vegetarian']");
    
    vegetarianBtn.addEventListener("click", function () {
        filterByVegStatus(true);
    });

    nonVegetarianBtn.addEventListener("click", function () {
        filterByVegStatus(false);
    });

    function filterByVegStatus(isVeg) {
        document.querySelectorAll(".dish").forEach(dish => {
            const isVegetarian = dish.querySelector(".vegetarian") !== null;
            dish.style.display = isVeg === isVegetarian ? "block" : "none";
        });
    }
});

function handleReadMore() {
    if (window.innerWidth >= 480) return;

    document.querySelectorAll(".dish-description").forEach(desc => {
        let shortText = desc.getAttribute("data-short");
        let fullText = desc.getAttribute("data-full");

        desc.innerHTML = shortText + ' <span class="read-more" style="color: #31B404; cursor: pointer;">Read More</span>';

        desc.addEventListener("click", function (event) {
            if (event.target.classList.contains("read-more")) {
                desc.innerHTML = fullText + ' <span class="read-less" style="color: #31B404; cursor: pointer;">Read Less</span>';
            } else if (event.target.classList.contains("read-less")) {
                desc.innerHTML = shortText + ' <span class="read-more" style="color: #31B404; cursor: pointer;">Read More</span>';
            }
        });
    });
}

function handleResize() {
    document.querySelectorAll(".dish-description").forEach(desc => {
        let fullText = desc.getAttribute("data-full");
        let shortText = desc.getAttribute("data-short");

        if (window.innerWidth >= 480) {
            desc.innerHTML = fullText;
        } else {
            desc.innerHTML = shortText + ' <span class="read-more" style="color: #31B404; cursor: pointer;">Read More</span>';
            handleReadMore();
        }
    });
}

window.addEventListener("resize", handleResize);
handleResize();

function filterDishes(category) {
    document.querySelectorAll(".dish").forEach(dish => {
        dish.style.display = category === "all" || dish.classList.contains(category) ? "block" : "none";
    });
}


fetch('header.json')
    .then(response => response.json())
    .then(data => {
        document.querySelector('.restaurant-name').textContent = data.restaurantName;
        document.querySelector('.restaurant-details').textContent = `${data.address} | ${data.contact}`;
    })
    .catch(error => console.error('Error loading header data:', error));

function generateStars(rating) {
    let fullStars = Math.floor(rating);
    let halfStar = rating % 1 !== 0;
    let starHTML = "";
    for (let i = 0; i < fullStars; i++) {
        starHTML += `<i class="fa fa-star" style="color: gold;"></i> `;
    }
    if (halfStar) {
        starHTML += `<i class="fa fa-star-half" style="color: gold;"></i> `;
    }
    return starHTML;
}


document.getElementById("toggle-nav").addEventListener("click", function () {
    document.getElementById("menu-container").style.display = "block";
    document.getElementById("footer-main").style.display = "none";
});

document.getElementById("toggle-nav").addEventListener("click", function () {
    document.getElementById("menu-container").style.display = "block";
    document.getElementById("footer-main").style.display = "none";

    // Hide footer-text when menu is open
    let footerText = document.querySelector(".footer-text");
    if (footerText) {
        footerText.style.display = "none";
    }
});

document.getElementById("hide-nav").addEventListener("click", function () {
    document.getElementById("menu-container").style.display = "none";
    document.getElementById("footer-main").style.display = "flex";

    // Show footer-text again when menu is hidden
    let footerText = document.querySelector(".footer-text");
    if (footerText) {
        footerText.style.display = "block";
    }
});

function filterDishes(category) {
    let allDishes = document.querySelectorAll('.dish');

    if (category === 'all') {
        // Show all dishes
        allDishes.forEach(dish => dish.style.display = 'block');
    } else {
        // Hide all dishes first
        allDishes.forEach(dish => dish.style.display = 'none');

        // Show only dishes that match the selected category
        document.querySelectorAll(`.dish.${category}`).forEach(dish => {
            dish.style.display = 'block';
        });
    }
}

// Select all menu links and add event listeners
document.querySelectorAll("#menu-nav a").forEach(menuItem => {
    menuItem.addEventListener("click", function () {
        // Hide the menu container
        document.getElementById("menu-container").style.display = "none";
        // Show the footer again
        document.getElementById("footer-main").style.display = "flex";
    });
});



function updateTheme() {
    const currentHour = new Date().getHours();
    const isLightMode = currentHour >= 7 && currentHour < 19; // 7 AM to 7 PM

    document.body.classList.toggle("light-mode", isLightMode);
    document.body.classList.toggle("dark-mode", !isLightMode);

    document.querySelectorAll(".content, .header, .footer, .dish").forEach(element => {
        element.classList.toggle("dark-content", !isLightMode);
        element.classList.toggle("light-content", isLightMode);
    });
}

updateTheme();
setInterval(updateTheme, 60000);
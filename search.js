
const inputElement = document.querySelector(".search-input");
const searchIcon = document.querySelector(".search-close-icon");
const sortWrapper = document.querySelector(".sort-wrapper");

inputElement.addEventListener("input", () => 
    handleInputChange(inputElement)
);

searchIcon.addEventListener("click", handleSearchIconCloseOnClick);
sortWrapper.addEventListener("click", handleSortIconOnClick);

function handleInputChange(inputElement) {
    const inputValue = inputElement.value;

    if(inputValue != "") {
        document.querySelector(".search-close-icon").classList.add("search-close-icon-visible");
    }
    else {
        document.querySelector(".search-close-icon").classList.remove("search-close-icon-visible");
    }
}

function handleSearchIconCloseOnClick() {
    document.querySelector(".search-input").value = "";
    document.querySelector(".search-close-icon").classList.remove("search-close-icon-visible");
}

function handleSortIconOnClick() {
    document.querySelector(".filter-wrapper").classList.toggle("filter-wrapper-open");
    document.querySelector("body").classList.toggle("filter-wrapper-overlay");
}

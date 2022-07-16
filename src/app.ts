const Autobind = (_: any, _2: string, descriptor: PropertyDescriptor) => {
    const originaFn = descriptor.value;

    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get(){
            return originaFn.bind(this);
        }
    };
    return adjDescriptor;
}

interface ApiResponse {
    number: number;
    offset: number;
    results: {
        id: number;
        image: string;
        imageType: string;
        title: string;
    }[]
}

interface Ingredients{
    id: number,
    extendedIngredients: {
        original: string
    }[]
}

interface RecipeStep{
    steps: {
        step: string
    }[]
}

interface Recipes extends Array<RecipeStep>{}

class App {
    private searchingBox: HTMLDivElement;
    private appInput: HTMLInputElement;
    private searchBtn: HTMLButtonElement;
    private appFooter: HTMLDivElement;
    private optionsPlace: HTMLDivElement;
    private imgBlock: HTMLDivElement;
    private resultBlock: HTMLDivElement;
    private API_KEY: string;
    constructor(){
            this.searchingBox = document.querySelector('.header__text-block')!;
            this.appInput = document.querySelector('.header__text-block-input')!;
            this.searchBtn = document.querySelector('.header__text-block-btn')!;
            this.appFooter = document.querySelector('.footer__year')!;
            this.optionsPlace = document.querySelector('.select-recipe')!;
            this.imgBlock = document.querySelector('.img-block')!;
            this.resultBlock = document.querySelector('.result-block')!;
            this.API_KEY = ''; // add your API key here 

            this.searchBtn.addEventListener('click', this.validate);

            this.footerYear();
    }

    footerYear(){
        const year = new Date().getFullYear();
        this.appFooter.textContent = year.toString();
    }

    @Autobind
    validate(){
        if(this.appInput.value === ''){
            this.searchingBox.classList.add('empty-input');

            setTimeout(() => {
                this.searchingBox.classList.remove('empty-input');
            }, 500);
            return;
        }
        const inputValue = this.appInput.value;
        this.optionsPlace.innerHTML = '';
        this.appInput.value = '';
        this.imgBlock.innerHTML = '';
        this.resultBlock.innerHTML = '';

        this.sendRequest(inputValue);
    }

    @Autobind
    sendRequest(inputValue: string){
        fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${inputValue}&apiKey=${this.API_KEY}&number=3`)
            .then(res => res.json())
            .then((data: ApiResponse) => {
                if(data.results.length === 0)
                    this.optionsPlace.innerHTML = `<p class='recipe-error'>Could not find any <span>'${inputValue}'</span> recipes.</p>`;
                data.results.forEach((el) => {
                    const optionDiv = document.createElement('div');
                    optionDiv.classList.add('select-recipe__option');
                    optionDiv.setAttribute('data-aos', 'zoom-in');

                    const divImage = `https://spoonacular.com/recipeImages/${el.id}-636x393.${el.imageType}`;

                    optionDiv.innerHTML = `
                        <img src="${divImage}" alt="Proposed food option">
                        <div class="select-recipe__option-desc">
                            <h3>${el.title}</h3>
                        </div>
                    `;

                    optionDiv.addEventListener('click', () => {
                        this.showRecipe(el.id, divImage, el.title)
                    });

                    this.optionsPlace.appendChild(optionDiv);
                });
            })
            .catch(err => {
                this.optionsPlace.innerHTML = `<p class='recipe-error'>Could not use the service right now.</p>`;
                console.error(err);
            })
    }

    @Autobind
    showRecipe(id: number, img: string, title: string){
        this.optionsPlace.innerHTML = '';

        const imgSection = document.createElement('img');
        imgSection.setAttribute('src', img);
        imgSection.setAttribute('alt', title);
        imgSection.classList.add('image');

        const imgDesc = document.createElement('p');
        imgDesc.classList.add('image-desc');

        this.imgBlock.append(imgSection, imgDesc);

        const ingredientsDiv = document.createElement('div');
        const recipesDiv = document.createElement('div');
        
        fetch(`https://api.spoonacular.com/recipes/${id}/information?includeNutrition=false&apiKey=${this.API_KEY}`)
            .then(res => res.json())
            .then((data: Ingredients) => {
                let ulList = '';

                ingredientsDiv.classList.add('ingredients');
                data.extendedIngredients.forEach(el => {
                    ulList = ulList + `<li>${el.original}</li>`;
                })

                ingredientsDiv.innerHTML = `
                <div class="wrapper">
                    <h2 class="ingredients__title">Ingredients</h2>
                        <ul>
                            ${ulList}
                        </ul>
                </div>
                `;
            })
            .catch(err => console.error(err))

        fetch(`https://api.spoonacular.com/recipes/${id}/analyzedInstructions?&apiKey=${this.API_KEY}`)
            .then(res => res.json())
            .then((data: Recipes) => {
                let instruction = '';
                
                recipesDiv.classList.add('recipe');
                data[0].steps.forEach(el => {
                    instruction = instruction + `${el.step} `;
                })

                recipesDiv.innerHTML = `
                    <div class="wrapper">
                        <h2 class="recipe__title">Recipe</h2>
                        <p class="recipe__desc">${instruction}</p>
                    </div>
                `;
            })
            .catch(err => console.error(err))

        this.resultBlock.append(ingredientsDiv, recipesDiv);
    }
}

new App();
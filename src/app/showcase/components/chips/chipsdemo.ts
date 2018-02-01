import {Component} from '@angular/core';
import {CountryService} from '../../service/countryservice';


@Component({
    templateUrl: './chipsdemo.html'
})
export class ChipsDemo {

    values1: string[];
    
    values2: string[];

    suggestionsList: string[];

    suggestions: any;

    filteredSuggestionMultiple: any[];

    filteredCountriesMultiple: any[];

    constructor(private countryService: CountryService) {
        this.suggestions = [];
       
    }

    searchWholeItem(inputText)
    {
        for (let i of this.suggestions) {
            if(i===inputText)
            {
                alert(i);
            }
         }
    }

    handleDropdownClick(selection) {
        alert(selection);
        this.values1 = this.values1||[];
        this.values1.push(selection);
    }

       
    filterCountryMultiple(event) {
        let query = event.query;
        
        this.countryService.getCountries().then(countries => {
            this.filteredCountriesMultiple = this.filterCountry(query, countries);
        });
    }
    
    filterCountry(query, countries: any[]):any[] {
        //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
        let filtered : any[] = [];
        for(let i = 0; i < countries.length; i++) {
            let country = countries[i];
            if(country.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                filtered.push(country);
            }
        }
        return filtered;
    }

    
}
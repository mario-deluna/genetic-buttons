/**
 * Genetic buttons 
 * A little fun project by Mario Döring 
 * I'ts not coded really well but works :)
 * ---
 * http://station.clancats.com
 * LICENSE MIT
 */

// basic definitation of all available genes
var genes = 
[
	{
		attr: "display",
		type: "choose",
		options: [
			"inline",
			"block",
			"inline-block",
		]
	},

	// -- Text 
	{
		attr: "text-align",
		type: "choose",
		options: [
			"left",
			"center",
			"right",
		]
	},
	{
		attr: "text-decoration",
		type: "choose",
		options: [
			"collection1",
			"property1",
			"none",
			"underline",
			"overline",
			"line-through",
			"initial",
			"inherit",
		]
	},

	// -- Color
	{
		attr: "color",
		type: "color",
	},
	{
		attr: "backgroundColor",
		type: "color",
	},

	// -- Padding / Margin
	{
		attr: "padding",
		type: "nested",
		template: "$0px $1px",
		genes: 
		[
			{
				type: "max",
				max: 20,
			},
			{
				type: "max",
				max: 20,
			},
		]
	},

	// Border 
	{
		attr: "border-radius",
		type: "max",
		max: 20,
		suffix: 'px'
	},
];

/**
 * The generator object
 */
var Generator = function(genes, container)
{
	this.availableGenes = genes;
	this.container = container;

	// current buttons
	this.population = [];
	this.selected = [];

	// the size of population to be generated
	this.populationSize = 40;
	this.mutationFrequency = 3;

}

/**
 * Generate a new population
 */
Generator.prototype.generatePopulation = function(fittestButtons)
{
	for (var i = 0; i < this.populationSize; i++)
	{
		var buttonGenes = [],
			fusionGenes = [],
			initialPopulation = true;

		if (fittestButtons !== undefined)
		{
			initialPopulation = false; 

			for(geneKey in this.availableGenes)
			{
				fusionGenes.push(fittestButtons[Math.round(Math.random())].genes[geneKey]);
			}
		}

		for(geneKey in this.availableGenes)
		{
			var geneTemplate = this.availableGenes[geneKey];

			if (initialPopulation || Math.floor(Math.random() * this.mutationFrequency) === 0)
			{
				buttonGenes.push(this.generateGeneValue(geneTemplate));
			}
			else
			{
				buttonGenes.push(fusionGenes[geneKey]);
			}
		}

		this.population.push(new Button(buttonGenes, this));
	}

	this.render();
};

/**
 * Generate a random value for the given gene
 */
Generator.prototype.generateGeneValue = function(geneTemplate)
{
	// choose gene
	if (geneTemplate.type === 'choose')
	{
		return Math.floor(Math.random() * geneTemplate['options'].length);
	}
	// color gene
	else if (geneTemplate.type === 'color')
	{
		return [
			Math.floor(Math.random() * 256),
			Math.floor(Math.random() * 256),
			Math.floor(Math.random() * 256)
		];
	}
	// max gene
	else if (geneTemplate.type === 'max')
	{
		return Math.floor(Math.random() * geneTemplate['max']);
	}
	// max gene
	else if (geneTemplate.type === 'nested')
	{
		var values = [];

		for(geneKey in geneTemplate['genes'])
		{
			values.push(this.generateGeneValue(geneTemplate['genes'][geneKey]));
		}

		return values;
	}
};

/**
 * Clear the container and the population
 */
Generator.prototype.clear = function()
{
	this.population = [];
	this.selected = [];

	while (this.container.hasChildNodes()) 
	{
	    this.container.removeChild(this.container.lastChild);
	}
};

/**
 * Render the population
 */
Generator.prototype.render = function()
{
	for(itemKey in this.population)
	{
		var button = this.population[itemKey];

		var buttonContainerElement = document.createElement("div");

		buttonContainerElement.className = 'button-container';
		buttonContainerElement.appendChild(button.render());

		this.container.appendChild(buttonContainerElement);
	}
};

/**
 * Select a button 
 */
Generator.prototype.selectButton = function(button)
{
	// check for toggle
	if (this.selected.length === 1 && this.selected[0] === button)
	{
		this.selected = [];
		button.element.parentElement.className = 'button-container';
		return;
	}

	// mark the parent element as selected
	button.element.parentElement.className += ' selected';

	// add the button to the selected
	this.selected.push(button);

	// when two are selected 
	// let them mate... 
	if (this.selected.length === 2)
	{
		var fittestButtons = this.selected;

		// clear and generate a new population with the base of the fittest ones
		this.clear();
		this.generatePopulation(fittestButtons);
	}
};


/**
 * The button object
 */
var Button = function(genes, generatorReference)
{
	this.genes = genes;
	this.generator = generatorReference
}

/**
 * Render a single button
 */
Button.prototype.render = function()
{
	var button = this;

	// assign the visible element
	this.element = document.createElement("a");

	this.element.innerText = "button";
	this.element.href = "#";
	this.element.onclick = function() 
	{
		button.generator.selectButton(button); return false; 
	}

	for(geneKey in this.generator.availableGenes)
	{
		var geneTemplate = this.generator.availableGenes[geneKey],
			geneValue;

		// choose gene
		if (geneTemplate.type === 'choose')
		{
			geneValue = geneTemplate['options'][this.genes[geneKey]];
		}
		// color gene
		else if (geneTemplate.type === 'color')
		{
			geneValue = 'rgba(' 
				+ this.genes[geneKey][0] + ', ' 
				+ this.genes[geneKey][1] + ', ' 
				+ this.genes[geneKey][2] + ', 1)';
		}
		// nested gene
		else if (geneTemplate.type === 'nested')
		{
			var geneValue = geneTemplate.template;

			for(nestedGeneKey in this.genes[geneKey])
			{
				geneValue = geneValue.replace('$' + nestedGeneKey, this.genes[geneKey][nestedGeneKey]);
			}
		}
		// everything else
		else
		{
			geneValue = this.genes[geneKey];
		}

		if (geneTemplate.suffix)
		{
			geneValue += geneTemplate.suffix;
		}

		this.element.style[geneTemplate.attr] = geneValue;
	}

	return this.element;
};
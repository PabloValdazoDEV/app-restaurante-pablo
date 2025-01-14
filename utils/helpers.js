module.exports = {
    /**
     * Helper para comparar dos valores y ejecutar diferentes bloques según el resultado.
     * @param {any} a - El primer valor a comparar.
     * @param {any} b - El segundo valor a comparar.
     * @param {object} options - Los bloques de Handlebars (fn e inverse).
     * @returns {string} - El contenido renderizado según la comparación.
     */
    ifEquals: function (a, b, options) {
        if (a === b) {
            return options.fn(this); // Renderiza el contenido si la condición es verdadera.
        } else {
            return options.inverse(this); // Renderiza el contenido si la condición es falsa.
        }
    }
};

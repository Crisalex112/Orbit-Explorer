import java.util.Scanner;

public class exploracioncolonizacionespacial {

    static Scanner entrada = new Scanner(System.in);

    static class ResultadoEvaluacion {

        double indice;
        double pesotemperatura;
        double pesogravedad;
        double pesopresion;
        double pesorecursos;

        String clasificacion;
        String motivo;

        public ResultadoEvaluacion(
                double indice,
                double pesotemperatura,
                double pesogravedad,
                double pesopresion,
                double pesorecursos,
                String clasificacion,
                String motivo) {

            this.indice = indice;
            this.pesotemperatura = pesotemperatura;
            this.pesogravedad = pesogravedad;
            this.pesopresion = pesopresion;
            this.pesorecursos = pesorecursos;
            this.clasificacion = clasificacion;
            this.motivo = motivo;
        }
    }


    public static void cargarbasedatos(String nombres[], String tipoubicacion[], double temperatura[],
            double presionat[], double gravedad[], double recursos[]) {
        nombres[0] = "Tierra";
        tipoubicacion[0] = "Planeta (Zona Habitable)";
        temperatura[0] = 288;
        presionat[0] = 1.013;
        gravedad[0] = 9.81;
        recursos[0] = 100;

        nombres[1] = "Marte";
        tipoubicacion[1] = "Planeta";
        temperatura[1] = 210;
        presionat[1] = 6;
        gravedad[1] = 3.71;
        recursos[1] = 65;

        nombres[2] = "Venus";
        tipoubicacion[2] = "Planeta";
        temperatura[2] = 737;
        presionat[2] = 93.219;
        gravedad[2] = 8.87;
        recursos[2] = 15;

        nombres[3] = "Luna";
        tipoubicacion[3] = "Satelite (Tierra)";
        temperatura[3] = 250;
        presionat[3] = 0;
        gravedad[3] = 1.62;
        recursos[3] = 45;

        nombres[4] = "Europa";
        tipoubicacion[4] = "Satelite (Júpiter)";
        temperatura[4] = 102;
        presionat[4] = 0;
        gravedad[4] = 1.31;
        recursos[4] = 80;

        nombres[5] = "Titan";
        tipoubicacion[5] = "Satélite (Saturno)";
        temperatura[5] = 94;
        presionat[5] = 1.469;
        gravedad[5] = 1.35;
        recursos[5] = 75;

        nombres[6] = "Encelado";
        tipoubicacion[6] = "Satélite (Saturno)";
        temperatura[6] = 75;
        presionat[6] = 0;
        gravedad[6] = 0.11;
        recursos[6] = 70;
    }

    public static void rankingRecursos(
        String[] nombres,
        double[] recursos,
        int contadorregistros) {

    String[] nombresRanking = new String[contadorregistros];
    double[] recursosRanking = new double[contadorregistros];

    // Copiamos nombres y recursos en arreglos temporales para no modificar los originales
    for (int i = 0; i < contadorregistros; i++) {

        nombresRanking[i] = nombres[i];
        recursosRanking[i] = recursos[i];

    }

    // Ordenar los recursos de mayor a menor
    for (int i = 0; i < contadorregistros - 1; i++) {

        for (int j = i + 1; j < contadorregistros; j++) {

            if (recursosRanking[j] > recursosRanking[i]) {

                // Intercambiar porcentajes de recursos
                double auxiliarRecurso = recursosRanking[i];
                recursosRanking[i] = recursosRanking[j];
                recursosRanking[j] = auxiliarRecurso;

                // Intercambiar también los nombres
                String auxiliarNombre = nombresRanking[i];
                nombresRanking[i] = nombresRanking[j];
                nombresRanking[j] = auxiliarNombre;

            }

        }

    }

    // Mostrar el ranking
    System.out.println("");
    System.out.println("RANKING DE RECURSOS APROVECHABLES");
    System.out.println("---------------------------------");

    for (int i = 0; i < contadorregistros; i++) {

        System.out.println(
                (i + 1) + ". "
                + nombresRanking[i]
                + " - "
                + recursosRanking[i]
                + " %");

    }

}

    //Muestra la lista de los cuerpos celestes registrados
    public static void listarCuerpos(String[] nombres, int contadorregistros){
        System.out.println("");
        System.out.println("PLANETAS REGISTRADOS");
        for (int i=0; i < contadorregistros; i++){
            System.out.println((i+1)+". "+nombres[i]);
        }
    }

    //Funcion encargada del ranking de clasificacion 
    public static void rankingClasificacion(String[] nombres, double[] temperatura, double[] presionat, double[] gravedad, double[] recursos, int contadorregistros){
        int contAlta=0;
        int contMedia=0;
        int contBaja=0;
        String[] alta = new String[contadorregistros];
        String[] media = new String[contadorregistros];
        String[] baja = new String[contadorregistros];
        for (int i=0; i < contadorregistros; i++){
            ResultadoEvaluacion resultado = evaluarhabitabilidad(temperatura[i], presionat[i], gravedad[i], recursos[i]);
            if (resultado.clasificacion.equals("Prioridad Alta (Habitable)")){
                alta[contAlta]= nombres[i];
                contAlta++;
            } else if (resultado.clasificacion.equals("Prioridad Media (Explorable)")){
                media[contMedia] = nombres[i];
                contMedia++;
            }else if (resultado.clasificacion.equals("Prioridad Baja (No recomendable)")){
                baja[contBaja]= nombres[i];
                contBaja++;
            }
        }
        System.out.println("LISTA DE PRIORIDADES DE EXPLORACION");
        System.out.println("----------------------------");
        System.out.println("PRIORIDAD ALTA (" + contAlta + ")");
        for (int i = 0; i < contAlta; i++) {
            System.out.println("- " + alta[i]);
        }
        System.out.println("----------------------------");
        System.out.println("PRIORIDAD MEDIA (" + contMedia + ")");
        for (int i = 0; i < contMedia; i++) {
            System.out.println("- " + media[i]);
        }
        System.out.println("----------------------------");
        System.out.println("PRIORIDAD BAJA (" + contBaja + ")");
        for (int i = 0; i < contBaja; i++) {
            System.out.println("- " + baja[i]);
        }
    }

    public static void rankingHabitabilidad(
        String[] nombres,
        double[] temperatura,
        double[] presionat,
        double[] gravedad,
        double[] recursos,
        int contadorregistros) {

    String[] nombresRanking = new String[contadorregistros];
    double[] indicesRanking = new double[contadorregistros];

    for (int i = 0; i < contadorregistros; i++) {

        ResultadoEvaluacion resultado = evaluarhabitabilidad(
                temperatura[i],
                presionat[i],
                gravedad[i],
                recursos[i]);

        nombresRanking[i] = nombres[i];
        indicesRanking[i] = resultado.indice;
    }

    for (int i = 0; i < contadorregistros - 1; i++) {

        for (int j = i + 1; j < contadorregistros; j++) {

            if (indicesRanking[j] > indicesRanking[i]) {

                double auxiliarIndice = indicesRanking[i];
                indicesRanking[i] = indicesRanking[j];
                indicesRanking[j] = auxiliarIndice;

                String auxiliarNombre = nombresRanking[i];
                nombresRanking[i] = nombresRanking[j];
                nombresRanking[j] = auxiliarNombre;
            }
        }
    }

    System.out.println("");
    System.out.println("RANKING DE HABITABILIDAD");

    for (int i = 0; i < contadorregistros; i++) {

        System.out.println(
                (i + 1) + ". "
                + nombresRanking[i]
                + " - "
                + indicesRanking[i]
                + " puntos");
    }


    
}   

    public static void ingresardatos(double temperatura[], double presionat[], double gravedad[],
            double recursos[], int indice) {
        temperatura[indice] = validarNumeros("Ingrese la temperatura promedio del cuerpo celeste (En Kelvin):",0,1000);

        presionat[indice] = validarNumeros("Ingrese la presión atmosférica del cuerpo celeste (En KPa):",0,100);

        gravedad[indice] = validarNumeros("Ingrese la gravedad promedio del cuerpo celeste (En m/s^2):",0.000001,30);

        recursos[indice] = validarNumeros("Ingrese el porcentaje de recursos utilizables del cuerpo celeste (%):",0,100);
    }

    public static ResultadoEvaluacion evaluarhabitabilidad(
            double temperatura,
            double presionat,
            double gravedad,
            double recursos) {

        String analisis;
        String clasificacion;
        String motivo;

        double indice;
        double pesogravedad;
        double pesopresion;
        double pesorecursos;
        double pesotemperatura;

        if (Math.abs(temperatura - 288) <= 15) {
            pesotemperatura = 25;
        } else if (Math.abs(temperatura - 288) <= 40) {
            pesotemperatura = 15;
        } else {
            pesotemperatura = 5;
        }

        if (Math.abs(gravedad - 9.81) <= 2) {
            pesogravedad = 25;
        } else if (Math.abs(gravedad - 9.81) <= 5) {
            pesogravedad = 15;
        } else {
            pesogravedad = 5;
        }

        if (Math.abs(presionat - 1.013) <= 10) {
            pesopresion = 25;
        } else if (Math.abs(presionat - 1.013) <= 50) {
            pesopresion = 15;
        } else {
            pesopresion = 5;
        }

        pesorecursos = (recursos / 100) * 25;

        indice = pesotemperatura
                + pesogravedad
                + pesopresion
                + pesorecursos;

        if (indice >= 80) {

            clasificacion =
                    "Prioridad Alta (Habitable)";

            analisis =
                    "El planeta fue clasificado como habitable. "
                    + "Es recomendable establecer una colonia. ";

        } else if (indice >= 50) {

            clasificacion =
                    "Prioridad Media (Explorable)";

            analisis =
                    "El planeta fue clasificado como explorable "
                    + "mediante misiones robóticas. ";

        } else {

            clasificacion =
                    "Prioridad Baja (No recomendable)";

            analisis =
                    "El planeta no es recomendable "
                    + "para la colonización. ";
        }

        if (recursos >= 60) {

            analisis +=
                    "Posee suficientes recursos ("
                    + recursos
                    + "%) para justificar una misión, ";

        } else {

            analisis +=
                    "No posee suficientes recursos para "
                    + "justificar una misión a gran escala, ";
        }

        if (pesotemperatura == 5
                || pesopresion == 5
                || pesogravedad == 5) {

            analisis +=
                    "pero requiere trajes especiales porque: ";

            if (pesotemperatura == 5) {
                analisis += "[la temperatura] ";
            }

            if (pesopresion == 5) {
                analisis += "[la presión] ";
            }

            if (pesogravedad == 5) {
                analisis += "[la gravedad] ";
            }

            analisis += "es extrema.";

        } else {

            analisis +=
                    "y permite exploración sin soporte vital extremo.";
        }

        motivo = analisis;

        return new ResultadoEvaluacion(
                indice,
                pesotemperatura,
                pesogravedad,
                pesopresion,
                pesorecursos,
                clasificacion,
                motivo);
    }

    public static void compararconlatierra(String nombre, double temperatura, double presionat,
            double gravedad, double recursos) {

        double difhabitabilidad;
        double difrecursos;
        double indicecalculado;

        ResultadoEvaluacion resultado = evaluarhabitabilidad(
                temperatura, presionat, gravedad, recursos);

        indicecalculado = resultado.indice;
        difhabitabilidad = Math.abs(100 - indicecalculado);
        difrecursos = Math.abs(100 - recursos);

        System.out.println("");
        System.out.println("==========================================================================");
        System.out.println("         COMPARACIÓN PORCENTUAL RESPECTO A LA TIERRA                      ");
        System.out.println("==========================================================================");
        System.out.println("Cuerpo Celeste | Habitabilidad | Dif. Tierra | Recursos | Dif. Recursos");
        System.out.println("--------------------------------------------------------------------------");
        System.out.println(nombre + " | " + indicecalculado + "% | " + difhabitabilidad
                + "% | " + recursos + "% | " + difrecursos + "%");
        System.out.println("==========================================================================");
    }

    public static void mostrarresultados(
            String nombre,
            double temperatura,
            double presion,
            double gravedad,
            double recursos,
            ResultadoEvaluacion resultado) {

        double diferenciaTemperatura = Math.abs(temperatura - 288);
        double diferenciaPresion = Math.abs(presion - 1.013);
        double diferenciaGravedad = Math.abs(gravedad - 9.81);
        double diferenciaRecursos = Math.abs(recursos - 100);

        System.out.println("");
        System.out.println("========== REPORTE DE EVALUACION ==========");
        System.out.println("Cuerpo celeste: " + nombre);

        System.out.println("\n----- TEMPERATURA -----");
        System.out.println("Referencia Tierra: 288 K");
        System.out.println("Valor del cuerpo: " + temperatura + " K");
        System.out.println("Diferencia: " + diferenciaTemperatura + " K");
        System.out.println("Puntaje obtenido: " + resultado.pesotemperatura + " puntos");

        System.out.println("\n----- PRESIÓN ATMOSFÉRICA -----");
        System.out.println("Referencia Tierra: 1.013 atm");
        System.out.println("Valor del cuerpo: " + presion + " atm");
        System.out.println("Diferencia: " + diferenciaPresion + " atm");
        System.out.println("Puntaje obtenido: " + resultado.pesopresion + " puntos");

        System.out.println("\n----- GRAVEDAD -----");
        System.out.println("Referencia Tierra: 9.81 m/s²");
        System.out.println("Valor del cuerpo: " + gravedad + " m/s²");
        System.out.println("Diferencia: " + diferenciaGravedad + " m/s²");
        System.out.println("Puntaje obtenido: " + resultado.pesogravedad + " puntos");

        System.out.println("\n----- RECURSOS -----");
        System.out.println("Referencia Tierra: 100%");
        System.out.println("Valor del cuerpo: " + recursos + "%");
        System.out.println("Diferencia: " + diferenciaRecursos + "%");
        System.out.println("Puntaje obtenido: " + resultado.pesorecursos + " puntos");

        System.out.println("\n========== ÍNDICE DE HABITABILIDAD ==========");
        System.out.println("Temperatura: " + resultado.pesotemperatura + " puntos");
        System.out.println("Gravedad: " + resultado.pesogravedad + " puntos");
        System.out.println("Presión: " + resultado.pesopresion + " puntos");
        System.out.println("Recursos: " + resultado.pesorecursos + " puntos");
        System.out.println("--------------------------------------------");
        System.out.println("ÍNDICE TOTAL: " + resultado.indice + " puntos");
        System.out.println("CLASIFICACIÓN: " + resultado.clasificacion);
        System.out.println("\nANÁLISIS:");
        System.out.println(resultado.motivo);
        System.out.println("============================================");
    }

    public static double validarNumeros(String mensaje, double minimo, double maximo) {

        double numero;

        while (true) {

            try {

                System.out.println(mensaje);

                numero = Double.parseDouble(entrada.nextLine());

                if (numero < minimo || numero > maximo) {

                    System.out.println("Error: El valor debe estar entre "
                            + minimo + " y " + maximo + ".");
                    System.out.println("");

                } else {

                    return numero;

                }

            } catch (NumberFormatException e) {

                System.out.println("Error: Debe ingresar un número válido.");
                System.out.println("");

            }

        }

    }

    public static int validarOpcion(String mensaje){
        while (true){
            try{
                System.out.println(mensaje);
                return Integer.parseInt(entrada.nextLine());

            }catch(NumberFormatException e){
                System.out.println("Debe ingresar un numero");
                System.out.println("");
            }
        }
    }

    public static String validarText(String mensaje) {
        String nombre;

        do {
            System.out.println(mensaje);
            nombre = entrada.nextLine().trim();

            if (nombre.isEmpty()) {
                System.out.println("Error: Este campo no puede quedar vacío.");
                System.out.println("");
            }

        } while (nombre.isEmpty());

        return nombre;
    }

    public static String validarNombre(String nombres[], int contadorregistros) {

        String nuevonombre;
        boolean nombreRepetido;

        do {

            nuevonombre = validarText("Ingrese el nombre:");

            nombreRepetido = false;

            for (int i = 0; i < contadorregistros; i++) {

                if (nombres[i].equalsIgnoreCase(nuevonombre)) {

                    nombreRepetido = true;

                    System.out.println("Error: Ese cuerpo celeste ya está registrado.");
                    System.out.println("");

                    break;

                }

            }

        } while (nombreRepetido);

        return nuevonombre;
    }


    public static void main(String args[]) {

        String buscarnombre;
        String clasificacion = "";
        int contadorregistros;
        double gravedad[];
        int i;
        double indicecalculado = 0;
        int indiceencontrado;
        String motivo = "";
        String nombres[];
        int opcionmenu;
        double presionat[];
        double recursos[];
        boolean salirprograma;
        int subopcion;
        double temperatura[];
        String tipoubicacion[];

        nombres = new String[50];
        tipoubicacion = new String[50];
        temperatura = new double[50];
        presionat = new double[50];
        gravedad = new double[50];
        recursos = new double[50];

        contadorregistros = 7;
        cargarbasedatos(nombres, tipoubicacion, temperatura, presionat, gravedad, recursos);
        salirprograma = false;

        do {
            System.out.println("");
            System.out.println(" Base de datos espacial y análisis");
            System.out.println("1. Buscar cuerpo celeste registrado");
            System.out.println("2. Registrar nuevo cuerpo celeste");
            System.out.println("3. Reportes");
            System.out.println("4. Salir del programa");
            opcionmenu = validarOpcion("Seleccione una opción:");

            switch (opcionmenu) {
                //Busquedad de cuerpo celeste
                case 1:
                    System.out.println("");
                    listarCuerpos(nombres, contadorregistros);
                    System.out.println("---------------------------------");
                    System.out.println("Ingrese el nombre del cuerpo celeste a buscar:");
                    buscarnombre = entrada.nextLine();
                    indiceencontrado = -1;

                    for (i = 0; i < contadorregistros; i++) {
                        if (nombres[i].equalsIgnoreCase(buscarnombre)){
                            indiceencontrado = i;
                            break;
                        }
                    }

                    if (indiceencontrado != -1) {
                        System.out.println("--- DATOS ENCONTRADOS ---");
                        System.out.println("Nombre: " + nombres[indiceencontrado]);
                        System.out.println("Tipo/Ubicación: " + tipoubicacion[indiceencontrado]);
                        System.out.println("Temperatura: " + temperatura[indiceencontrado] + " K");
                        System.out.println("Presión Atmosférica: " + presionat[indiceencontrado] + " KPa");
                        System.out.println("Gravedad: " + gravedad[indiceencontrado] + " m/s^2");
                        System.out.println("Recursos: " + recursos[indiceencontrado] + " %");
                        System.out.println("-------------------------");
                        System.out.println("¿Qué desea hacer con este cuerpo celeste?");
                        System.out.println("1. Calcular Habitabilidad / Explorabilidad");
                        System.out.println("2. Comparar con la Tierra");
                        System.out.println("3. Volver al menú principal");
                        System.out.println("4. Salir del programa");

                        subopcion = validarOpcion("Seleccione su opción:");

                        switch (subopcion) {
                            //Evaluador de habitabilidad
                            case 1:
                                System.out.println("");

                                ResultadoEvaluacion resultado = evaluarhabitabilidad(
                                        temperatura[indiceencontrado],
                                        presionat[indiceencontrado],
                                        gravedad[indiceencontrado],
                                        recursos[indiceencontrado]);

                                indicecalculado = resultado.indice;
                                clasificacion = resultado.clasificacion;
                                motivo = resultado.motivo;

                                mostrarresultados(nombres[indiceencontrado],
                                    temperatura[indiceencontrado],
                                    presionat[indiceencontrado],
                                    gravedad[indiceencontrado],
                                    recursos[indiceencontrado],
                                    resultado);
                                break;

                            //Comparacion con la tierra
                            case 2:
                                System.out.println("");
                                compararconlatierra(
                                        nombres[indiceencontrado],
                                        temperatura[indiceencontrado],
                                        presionat[indiceencontrado],
                                        gravedad[indiceencontrado],
                                        recursos[indiceencontrado]);

                                System.out.println("Regresando al menú principal...");
                                break;
                            //Volver al Menu principal :V
                            case 3:
                                break;
                            //Cerrar el programa 
                            case 4:
                                salirprograma = true;
                                break;

                            default:
                                System.out.println("Opción no válida.");
                        }
                    } else {
                        System.out.println("El cuerpo celeste " + buscarnombre
                                + " no se encuentra registrado en el sistema.");
                    }
                    break;
                //Registrar un nuevo cuerpo celeste
                case 2:
                    if (contadorregistros < 50) {
                        System.out.println("");
                        System.out.println("--- REGISTRO DE NUEVO CUERPO CELESTE ---");
                        nombres[contadorregistros] = validarNombre(nombres, contadorregistros);

                        tipoubicacion[contadorregistros] = validarText("Ingrese el Tipo o Ubicación (Ej: Planeta, Satélite, Exoplaneta):");

                        ingresardatos(
                                temperatura,
                                presionat,
                                gravedad,
                                recursos,
                                contadorregistros);

                        System.out.println("Datos guardados con éxito en la base de datos");
                        contadorregistros++;
                    } else {
                        System.out.println("Error: La base de datos ha alcanzado su límite máximo (50).");
                    }
                    break;
                //Generador de reportes
                case 3:
                    do{
                        System.out.println("");
                        System.out.println("REPORTES PLANETARIOS");
                        System.out.println("1. Lista de cuerpos celestes registrados");
                        System.out.println("2. Ranking de habitabilidad");
                        System.out.println("3. Ranking de recursos");
                        System.out.println("4. Tipos de clasificaciones");
                        System.out.println("5. Volver al menú");
                        subopcion = validarOpcion("Seleccione su opción:");
                        switch (subopcion) {
                            //Lista de los cuerpos celestes
                            case 1:
                                System.out.println("");
                                listarCuerpos(nombres, contadorregistros);
                                break;
                            //Rankings de habitabilidad por puntaje, muestra el indice de cada planeta y lo ordena del mas habitable al menos habitable 
                            case 2:
                                System.out.println("");
                                rankingHabitabilidad(nombres, temperatura, presionat, gravedad, recursos, contadorregistros);
                                break;
                            case 3:
                            // Rankung de recursos por planetas
                                System.out.println("");
                                rankingRecursos(nombres, recursos, contadorregistros);
                                break;
                            case 4:
                                System.out.println("");
                                rankingClasificacion(nombres, temperatura, presionat, gravedad, recursos, contadorregistros);
                                break;
                            case 5:
                                break;
                            default:
                                System.out.println("Opcion no valida");
                        }
                    }while (subopcion!= 5);
                    break;
                case 4:
                    salirprograma = true;
                    break;
                default:
                    System.out.println("Opción inválida. Por favor, seleccione 1, 2 o 3.");
            }

        } while (!salirprograma);

        System.out.println("Programa finalizado.");
        entrada.close();
    }
}

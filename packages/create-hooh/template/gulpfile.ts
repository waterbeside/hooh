import gulp from 'gulp'
import del from 'del'
import ts from 'gulp-typescript'
const tsProjest = ts.createProject('tsconfig.json')

gulp.task('clean', async () => {
  await del(['app/*'])
})

gulp.task('compile', async () => {
  tsProjest.src().pipe(tsProjest()).js.pipe(gulp.dest('app'))
})

gulp.task('copyView', async () => {
  gulp.src('src/view/**/*').pipe(gulp.dest('app/view'))
})

gulp.task('build', gulp.series('clean', 'compile', 'copyView'))
